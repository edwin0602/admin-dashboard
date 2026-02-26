"use client";

import api from "@/lib/services/client";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import { DataTable } from "../collections/[cid]/components/data-table";
import TableSkeleton from "../collections/[cid]/components/table-skeleton";
import { CreateStaffModal } from "./forms/CreateStaffModal";
import { EditStaffModal } from "./forms/EditStaffModal";
import { ColumnDef } from "@tanstack/react-table";
import { config } from "@/config/app.config";
import { findCollectionById } from "@/helpers/findCollectionById";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { setCollection } from "@/redux/collectionSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { selectTotal, setTotal } from "@/redux/appSlice";
import { IRole } from "@/interfaces/IRole";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { PERMISSIONS } from "@/config/permissions.config";

export default function StaffPage() {
    const [data, setData] = useState<Models.Document[]>([]);
    const [roles, setRoles] = useState<IRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedStaff, setSelectedStaff] = useState<Models.Document | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { hasPermission, isLoading } = usePermissions();
    const router = useRouter();

    const total = useAppSelector(selectTotal);

    const { toast } = useToast();
    const dispatch: Dispatch = useAppDispatch();

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const [staffRes, rolesRes] = await Promise.all([
                api.getDocuments(config.staffCollectionId),
                api.getRoles()
            ]);
            setData(staffRes.documents);
            setRoles(rolesRes.documents as IRole[]);
            dispatch(setTotal(staffRes.total));
        } catch (error: any) {
            console.error("Error fetching staff data:", error);
            toast({
                title: "Error",
                description: "Could not load staff or roles list.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getRoleName = (roleId: string) => {
        const role = roles.find(r => r.$id === roleId || r.name === roleId);
        return role ? role.name : roleId;
    };

    const columns: ColumnDef<Models.Document>[] = [
        {
            accessorKey: "fullName",
            header: "Full Name",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <span className="text-sm">{row.original.email}</span>
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <span className="text-sm">{row.original.phone || "—"}</span>
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <Badge variant="secondary" className="capitalize">
                    {getRoleName(row.original.role)}
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                if (status.toLowerCase() === "active") variant = "default";
                if (status.toLowerCase() === "banned") variant = "destructive";
                return <Badge variant={variant}>{status}</Badge>;
            }
        },
    ];

    const handleRowClick = (staff: Models.Document) => {
        setSelectedStaff(staff);
        setIsEditOpen(true);
    };

    useEffect(() => {
        if (config.staffCollectionId) {
            fetchStaff();
            const collection = findCollectionById(config.staffCollectionId);
            if (collection) {
                dispatch(setCollection(collection));
                dispatch(setTotal(0));
            }
        }
    }, [config.staffCollectionId]);

    useEffect(() => {
        if (!isLoading && !hasPermission(PERMISSIONS.STAFF.READ)) {
            router.replace("/app");
            toast({
                title: "Unauthorized",
                description: "You do not have permission to view this page.",
                variant: "destructive",
            });
        }
    }, [isLoading, hasPermission, router]);

    if (isLoading) return <TableSkeleton />;
    if (!hasPermission(PERMISSIONS.STAFF.READ)) return null;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl mb-1 font-semibold flex items-center gap-3">
                        Staff
                        <span className="text-xs bg-muted p-1 px-2 font-normal text-foreground rounded-full">
                            {total} Documents
                        </span></h1>
                    <p className="text-muted-foreground mb-6 text-sm">
                        Manage system staff, roles, and access status. Click a row to edit.
                    </p>
                </div>
                <CreateStaffModal onSuccess={fetchStaff} />
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <DataTable
                    loading={false}
                    hideAddButton={true}
                    columns={columns}
                    data={data}
                    searchColumn="fullName"
                    pagination={true}
                    onRowClick={handleRowClick}
                />
            )}

            <EditStaffModal
                staff={selectedStaff}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={fetchStaff}
            />
        </div>
    );
}


