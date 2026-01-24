"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { createCounterparty } from "@/actions/counterparties";
import useFetch from "@/hooks/use-fetch";

// Add a new person inline (mirrors CreateAccountDrawer). On success, calls
// onCreated with the new counterparty so the caller can select it immediately.
export function CreateCounterpartyDrawer({ children, onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const { fn: createFn, data: result, loading } = useFetch(createCounterparty);

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      toast.success("Person added");
      onCreated?.(result.data);
      setName("");
      setPhone("");
      setNotes("");
      setOpen(false);
    } else {
      toast.error(result.error || "Failed to add person");
    }
  }, [result]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    createFn({ name, phone, notes });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add a person</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ravi"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Phone <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              inputMode="tel"
            />
            <p className="text-xs text-muted-foreground">
              Needed to send a WhatsApp nudge. Indian mobile number.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Notes <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How you know them, etc."
            />
          </div>
          <div className="flex gap-4 pt-2">
            <DrawerClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add person"
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
