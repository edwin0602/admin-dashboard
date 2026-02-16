import Logo from "@/components/shared/Logo";
import React from "react";
import { UserAuthForm } from "./components/LoginForm";
import { config } from "@/config/app.config";

const LoginPage = () => {
  return (
    <>
      <div className="mx-auto bg-muted/40 border backdrop-blur rounded-lg px-6 py-8 flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col mb-5 items-center space-y-2 text-center">
          <Logo className="w-[65px] h-[65px]" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {config.projectName}
          </h1>
        </div>
        <UserAuthForm />
      </div>
    </>
  );
};

export default LoginPage;


