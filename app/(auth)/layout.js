import Image from "next/image";
import AuthNavbar from "@/components/auth-navbar";
import Footer from "@/components/footer";

const AuthLayout = ({ children }) => {
  return (
    <>
      <AuthNavbar />
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-32 lg:pt-0">
          {children}
        </div>
        <div className="hidden bg-card lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <Image
            src="/sigininpage.svg"
            alt=""
            width={800}
            height={1000}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AuthLayout;
