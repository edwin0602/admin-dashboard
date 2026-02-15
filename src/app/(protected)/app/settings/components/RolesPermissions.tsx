"use client";

import React, { useEffect, useState } from "react";
import api from "@/appwrite/appwrite.client";
import { IRole } from "@/interfaces/IRole";
import { IPermission } from "@/interfaces/IPermission";
import { IRolePermission } from "@/interfaces/IRolePermission";
import { Loader2, Save, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
        if (!acc[perm.group]) acc[perm.group] = [];
        acc[perm.group].push(perm);
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Roles List */}
                <Card className="md:col-span-1 bg-muted/50 border-primary/20 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-md font-medium">Roles</CardTitle>
                        <CardDescription>Select a role to manage permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                            <div className="flex flex-col">
                                {roles.map((role) => (
                                    <button
                                        key={role.$id}
                                        onClick={() => handleRoleSelect(role)}
                                        className={`flex flex-col items-start gap-1 p-4 text-left transition-colors hover:bg-muted ${selectedRole?.$id === role.$id ? "bg-muted" : ""
                                            }`}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span className="font-semibold text-sm">{role.name}</span>
                                            {role.isSystem && (
                                                <Badge variant="secondary" className="text-[10px] h-4">
                                                    System
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                            {role.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Permissions Grid */}
                <Card className="md:col-span-2 bg-muted/50 border-primary/20 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-md font-medium">
                                    {selectedRole ? `Permissions for ${selectedRole.name}` : "Select a role"}
                                </CardTitle>
                                <CardDescription>
                                    {selectedRole?.isSystem
                                        ? "System roles cannot be modified"
                                        : "Toggle checkboxes to assign/remove permissions"}
                                </CardDescription>
                            </div>
                            {selectedRole?.isSystem && <ShieldAlert className="h-5 w-5 text-yellow-500" />}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingPermissions ? (
                            <div className="flex items-center justify-center h-[300px]">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : selectedRole ? (
                            <ScrollArea className="h-[350px] pr-4">
                                <div className="space-y-6">
                                    {Object.entries(permissionsByGroup).map(([group, perms]) => (
                                        <div key={group} className="space-y-3">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                {group}
                                            </h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {perms.map((perm) => {
                                                    const isChecked = rolePermissions.some(rp => rp.permissionId === perm.$id);
                                                    return (
                                                        <div
                                                            key={perm.$id}
                                                            className="flex items-start space-x-3 space-y-0"
                                                        >
                                                            <Checkbox
                                                                id={perm.$id}
                                                                checked={isChecked}
                                                                onCheckedChange={() => handleTogglePermission(perm.$id)}
                                                                disabled={selectedRole.isSystem || saving}
                                                            />
                                                            <div className="grid gap-1.5 leading-none">
                                                                <label
                                                                    htmlFor={perm.$id}
                                                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${selectedRole.isSystem ? "cursor-not-allowed" : "cursor-pointer"
                                                                        }`}
                                                                >
                                                                    {perm.description}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <Separator className="mt-4" />
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                                <ShieldCheck className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">Select a role to see its permissions</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};

export default RolesPermissions;
