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
        <div className="hidden items-center justify-center  p-12 lg:flex lg:flex-1">
          <Image
            src="/auth-image.svg"
            alt=""
            width={793}
            height={552}
            className="h-auto w-full max-w-[480px] object-contain"
            priority
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AuthLayout;
