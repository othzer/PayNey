"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAccount, deleteAccount } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";

export function AccountMenu({ account, onUpdated, onDeleted }) {
  const [dialog, setDialog] = useState(null);
  const [name, setName] = useState(account.name);
  const [type, setType] = useState(account.type);

  const {
    fn: updateFn,
    data: updateResult,
    loading: updateLoading,
  } = useFetch(updateAccount);
  const {
    fn: deleteFn,
    data: deleteResult,
    loading: deleteLoading,
  } = useFetch(deleteAccount);

  useEffect(() => {
    if (!updateResult) return;
    if (updateResult.success) {
      toast.success("Account updated");
      onUpdated(updateResult.data);
      setDialog(null);
    } else {
      toast.error(updateResult.error || "Failed to update account");
    }
  }, [updateResult]);

  useEffect(() => {
    if (!deleteResult) return;
    if (deleteResult.success) {
      toast.success("Account deleted");
      onDeleted(account.id, deleteResult.newDefaultAccountId);
    } else {
      toast.error(deleteResult.error || "Failed to delete account");
    }
  }, [deleteResult]);

  const handleDelete = () => {
    const count = account._count?.transactions ?? 0;
    const confirmed = window.confirm(
      `Delete "${account.name}"? This will permanently delete this account and all ${count} of its transactions. This can't be undone.`
    );
    if (!confirmed) return;
    deleteFn(account.id);
  };

  const handleRenameSave = () => {
    if (!name.trim()) {
      toast.error("Name can't be empty");
      return;
    }
    updateFn(account.id, { name: name.trim() });
  };

  const handleTypeSave = () => {
    updateFn(account.id, { type });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setName(account.name);
              setDialog("rename");
            }}
          >
            Rename account
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setType(account.type);
              setDialog("type");
            }}
          >
            Change type
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Drawer
        open={dialog === "rename"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Rename account</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Account name"
              autoFocus
            />
            <div className="flex gap-4">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                className="flex-1"
                onClick={handleRenameSave}
                disabled={updateLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={dialog === "type"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Change account type</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CURRENT">Current</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-4">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                className="flex-1"
                onClick={handleTypeSave}
                disabled={updateLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
