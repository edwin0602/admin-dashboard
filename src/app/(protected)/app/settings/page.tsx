import React from "react";

import { config } from "@/config/app.config";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  // Extract unique roles from config
  const roles = Array.from(new Set(
    config.collections
      .flatMap(c => c.columns || [])
      .filter(col => col.key === "role" && col.type === "enum")
      .flatMap(col => (col as any).options || [])
  ));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-1 font-semibold flex items-center gap-3">Settings</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Manage your application settings and project configuration.
        </p>
      </div>
      <Separator />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Available Roles</h2>
        <div className="flex flex-wrap gap-2">
          {roles.map(role => (
            <Badge key={role} variant="outline" className="px-3 py-1 text-sm">
              {role}
            </Badge>
          ))}
          {roles.length === 0 && (
            <Badge variant="outline" className="px-3 py-1 text-sm">
              user
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          These roles can be assigned to users during creation or editing.
        </p>
      </section>
    </div>
  );
};

export default Settings;
