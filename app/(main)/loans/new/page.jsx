import { notFound } from "next/navigation";
import { getCounterparties } from "@/actions/counterparties";
import { getLoan } from "@/actions/loans";
import { LoanForm } from "../_components/loan-form";

export default async function NewOrEditLoanPage({ searchParams }) {
  const params = await searchParams;
  const editId = params?.edit;

  const [counterparties, initialData] = await Promise.all([
    getCounterparties(),
    editId ? getLoan(editId) : Promise.resolve(null),
  ]);

  // An edit link for a loan that doesn't exist (or isn't the user's) would
  // otherwise render a broken edit form that crashes on submit (initialData.id
  // is null). 404 instead.
  if (editId && !initialData) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">
        {editId ? "Edit loan" : "Add loan"}
      </h1>
      <LoanForm
        counterparties={counterparties}
        editMode={Boolean(editId)}
        initialData={initialData}
      />
    </div>
  );
}
