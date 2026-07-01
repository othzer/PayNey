import Header from "@/components/header";

const AuthLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div className="flex justify-center pt-40">{children}</div>
      <footer className="bg-blue-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Made with 💗 by Otzr.Labs</p>
        </div>
      </footer>
    </>
  );
};

export default AuthLayout;
