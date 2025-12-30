import DashboardPage from "./page";
import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout() {
  return (
    <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#222FA8" />}>
      <DashboardPage />
    </Suspense>
  );
}
