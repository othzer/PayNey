import { getLoans, getLoanDashboardTiles } from "@/actions/loans";
import { LoansClient } from "./_components/loans-client";

export default async function LoansPage() {
  const [loans, tiles] = await Promise.all([
    getLoans(),
    getLoanDashboardTiles(),
  ]);

  return <LoansClient loans={loans} tiles={tiles} />;
}
