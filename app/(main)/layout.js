import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div className="container mx-auto my-32">{children}</div>
      <Footer />
    </>
  );
};

export default MainLayout;
