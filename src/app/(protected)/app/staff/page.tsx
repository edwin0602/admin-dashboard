"use client";

import api from "@/appwrite/appwrite.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Models } from "appwrite";
import { Mail, Plus, Trash, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "../collections/[cid]/components/data-table";
import TableSkeleton from "../collections/[cid]/components/table-skeleton";
import { CreateStaffModal } from "./forms/CreateStaffModal";
import { EditStaffModal } from "./forms/EditStaffModal";
import { ColumnDef } from "@tanstack/react-table";
import { config } from "@/config/app.config";
import { findCollectionById } from "@/helpers/findCollectionById";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { setCollection } from "@/redux/collectionSlice";
import { Dispatch } from "@reduxjs/toolkit";

export default function StaffPage() {
    const [data, setData] = useState<Models.Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedStaff, setSelectedStaff] = useState<Models.Document | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { toast } = useToast();
    const dispatch: Dispatch = useAppDispatch();

    const staffCID = config.collections.find(c => c.name === "Staff")?.collectionId || "";

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await api.getDocuments(staffCID);
            setData(response.documents);
        } catch (error: any) {
            console.error("Error fetching staff:", error);
            toast({
                title: "Error",
                description: "Could not load staff list.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
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
            cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.role}</Badge>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                if (status === "ACTIVE") variant = "default";
                if (status === "BANNED") variant = "destructive";
                return <Badge variant={variant}>{status}</Badge>;
            }
        },
    ];

    const handleRowClick = (staff: Models.Document) => {
        setSelectedStaff(staff);
        setIsEditOpen(true);
    };

    useEffect(() => {
        if (staffCID) {
            fetchStaff();
            const collection = findCollectionById(staffCID);
            if (collection) {
                dispatch(setCollection(collection));
            }
        }
    }, [staffCID]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
                    <p className="text-muted-foreground">
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
