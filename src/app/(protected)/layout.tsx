"use client";
import PageLoader from "@/components/shared/PageLoader";
import { store } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import api from "@/lib/services/client";
import { setAuthData, setLoading as setAuthLoading } from "@/redux/authSlice";

const ProtectedLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const check = async () => {
      try {
        const authData = await api.getCurrentUserPermissions();
        store.dispatch(setAuthData(authData));

        if (!pathname.startsWith("/app")) {
          router.replace("/app");
        } else {
          setLoading(false);
          store.dispatch(setAuthLoading(false));
        }
      } catch (err) {
        router.replace("/login");
      }
    };

    check();
  }, [router, pathname]);


  if (loading) return <PageLoader />;

  return <>{children}</>;
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </Provider>
  );
};

export default ProtectedLayout;


