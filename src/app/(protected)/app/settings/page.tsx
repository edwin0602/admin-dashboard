"use client";

import React from "react";

import { Separator } from "@/components/ui/separator";
import RolesPermissions from "./components/RolesPermissions";

const Settings = () => {

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
