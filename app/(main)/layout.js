import React from "react";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { checkUser } from "@/lib/checkUser";
import { getPendingReviewCount } from "@/actions/dashboard";

const MainLayout = async ({ children }) => {
  await checkUser();
  const pendingReviewCount = await getPendingReviewCount();

  return (
    <div className="flex">
      <Sidebar pendingReviewCount={pendingReviewCount} />
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex-1 px-6 py-6">{children}</div>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
