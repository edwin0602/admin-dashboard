"use client";
import PageLoader from "@/components/shared/PageLoader";
import { getAccount } from "@/lib/services/client/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const check = async () => {
      try {
        const user = await getAccount();
        if (user) {
          //router.replace("/app");
        }
      } catch (err: any) {
        // No active session is expected for public routes
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [router]);
  return (
    <>
      {loading ? (
        <PageLoader />
      ) : (
        <main className="w-screen h-screen flex flex-col overflow-hidden items-center justify-center">
          {children}
        </main>
      )}
    </>
  );
};

export default AuthLayout;


