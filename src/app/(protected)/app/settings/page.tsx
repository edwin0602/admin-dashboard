"use client";

import React from "react";

import { Separator } from "@/components/ui/separator";
import RolesPermissions from "./components/RolesPermissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import TableSkeleton from "../collections/[cid]/components/table-skeleton";
import { PERMISSION_GROUPS } from "@/config/permissions.config";

const Settings = () => {

  const { hasGroup, isLoading } = usePermissions();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !hasGroup(PERMISSION_GROUPS.CONFIG_READ)) {
      router.replace("/app");
      toast({
        title: "Unauthorized",
        description: "You do not have permission to access Settings.",
        variant: "destructive",
      });
    }
  }, [isLoading, hasGroup, router]);

  if (isLoading) return <TableSkeleton />;
  if (!hasGroup(PERMISSION_GROUPS.CONFIG_READ)) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl mb-1 font-semibold flex items-center gap-3">Settings</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Manage your application settings and project configuration.
        </p>
      </div>
      <Separator />

      <RolesPermissions />

    </div>
  );
};

export default Settings;
