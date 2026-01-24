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
