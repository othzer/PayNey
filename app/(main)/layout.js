import React from "react";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { checkUser } from "@/lib/checkUser";
import { getPendingReviewCount } from "@/actions/dashboard";
import { getOverdueLoanCount } from "@/actions/loans";

const MainLayout = async ({ children }) => {
  await checkUser();
  const [pendingReviewCount, overdueLoanCount] = await Promise.all([
    getPendingReviewCount(),
    getOverdueLoanCount(),
  ]);

  return (
    <div className="flex">
      <Sidebar
        pendingReviewCount={pendingReviewCount}
        overdueLoanCount={overdueLoanCount}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex-1 px-6 py-6">{children}</div>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
