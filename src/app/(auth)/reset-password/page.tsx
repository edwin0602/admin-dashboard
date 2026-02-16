import Logo from "@/components/shared/Logo";
import React, { Suspense } from "react";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { Loader2 } from "lucide-react";

const ResetPasswordPage = () => {
    return (
        <>
            <div className="mx-auto bg-muted/40 border backdrop-blur rounded-lg px-6 py-8 flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                <div className="flex flex-col mb-5 items-center space-y-2 text-center">
                    <Logo className="w-[65px] h-[65px]" />
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Reset Password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your new password below.
                    </p>
                </div>
                <Suspense fallback={
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </>
    );
};

export default ResetPasswordPage;


