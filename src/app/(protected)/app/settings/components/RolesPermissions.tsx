"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/services/client";
import { IRole } from "@/interfaces/IRole";
import { IPermission } from "@/interfaces/IPermission";
import { IRolePermission } from "@/interfaces/IRolePermission";
import { Loader2, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const RolesPermissions = () => {
    const { toast } = useToast();
    const [roles, setRoles] = useState<IRole[]>([]);
    const [permissions, setPermissions] = useState<IPermission[]>([]);
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
    const [rolePermissions, setRolePermissions] = useState<IRolePermission[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                api.getRoles(),
                api.getPermissions()
            ]);
            setRoles(rolesRes.documents as IRole[]);
            setPermissions(permsRes.documents as IPermission[]);
        } catch (error: any) {
            toast({
                title: "Error fetching data",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = async (role: IRole) => {
        setSelectedRole(role);
        try {
            setLoadingPermissions(true);
            const res = await api.getRolePermissionsByRole(role.$id);
            setRolePermissions(res.documents as IRolePermission[]);
        } catch (error: any) {
            toast({
                title: "Error fetching role permissions",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoadingPermissions(false);
        }
    };

    const handleTogglePermission = async (permissionId: string) => {
        if (!selectedRole || selectedRole.isSystem || saving) return;

        const existing = rolePermissions.find(rp => rp.permissionId === permissionId);

        try {
            setSaving(true);
            if (existing) {
                await api.deleteRolePermission(existing.$id);
                setRolePermissions(rolePermissions.filter(rp => rp.$id !== existing.$id));
                toast({ title: "Permission removed" });
            } else {
                const newRP = await api.addRolePermission(selectedRole.$id, permissionId);
                setRolePermissions([...rolePermissions, newRP as IRolePermission]);
                toast({ title: "Permission added" });
            }
        } catch (error: any) {
            toast({
                title: "Error updating permission",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const permissionsByGroup = permissions.reduce((acc, perm) => {
        const groupKey = perm.group.split('_')[0];
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(perm);
        return acc;
    }, {} as Record<string, IPermission[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Roles & Permissions</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Manage system roles and assign specific permissions to control user access levels.
                </p>
            </div>

            <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-md font-medium">Role & Permissions Management</CardTitle>
                            <CardDescription>
                                {selectedRole?.isSystem
                                    ? "System roles cannot be modified"
                                    : "Select a role and toggle permissions to update access levels"}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-[300px]">
                            <Select
                                value={selectedRole?.$id || ""}
                                onValueChange={(value) => {
                                    const role = roles.find(r => r.$id === value);
                                    if (role) handleRoleSelect(role);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.$id} value={role.$id}>
                                            <div className="flex items-center gap-2">
                                                <span>{role.name}</span>
                                                {role.isSystem && (
                                                    <Badge variant="secondary" className="text-[10px] h-3 px-1">
                                                        System
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedRole?.isSystem && <ShieldAlert className="h-5 w-5 text-yellow-500 shrink-0" />}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingPermissions ? (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : selectedRole ? (
                        <ScrollArea className="h-[500px] pr-4">
                            <Accordion type="multiple" className="w-full space-y-2">
                                {Object.entries(permissionsByGroup).map(([group, perms]) => (
                                    <AccordionItem key={group} value={group} className="border rounded-lg px-4 bg-muted/30">
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                                                    {group}
                                                </h4>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {perms.length} Permissions
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-col border rounded-md mb-4 bg-background overflow-hidden">
                                                {/* Table Header */}
                                                <div className="grid grid-cols-[1fr_auto] gap-4 p-3 bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    <div>Permission Name</div>
                                                    <div className="text-center w-12">Set</div>
                                                </div>
                                                {/* Table Rows */}
                                                <div className="divide-y">
                                                    {perms.map((perm) => {
                                                        const isChecked = rolePermissions.some(rp => rp.permissionId === perm.$id);
                                                        return (
                                                            <div
                                                                key={perm.$id}
                                                                className={cn(
                                                                    "grid grid-cols-[1fr_auto] gap-4 p-3 items-center transition-colors hover:bg-muted/30",
                                                                    selectedRole.isSystem ? "opacity-70" : ""
                                                                )}
                                                            >
                                                                <div className="flex flex-col gap-0.5">
                                                                    <label
                                                                        htmlFor={perm.$id}
                                                                        className={cn(
                                                                            "text-sm font-medium leading-none",
                                                                            selectedRole.isSystem ? "cursor-not-allowed" : "cursor-pointer"
                                                                        )}
                                                                    >
                                                                        {perm.description}
                                                                    </label>
                                                                    <span className="text-[10px] text-muted-foreground">{perm.$id}</span>
                                                                </div>
                                                                <div className="flex items-center justify-center w-12">
                                                                    <Checkbox
                                                                        id={perm.$id}
                                                                        checked={isChecked}
                                                                        onCheckedChange={() => handleTogglePermission(perm.$id)}
                                                                        disabled={selectedRole.isSystem || saving}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </ScrollArea>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                            <ShieldCheck className="h-12 w-12 mb-2 opacity-20" />
                            <p className="text-sm font-medium">Select a role to manage system permissions</p>
                            <p className="text-xs opacity-60">Control user access levels across the application</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
};

export default RolesPermissions;


