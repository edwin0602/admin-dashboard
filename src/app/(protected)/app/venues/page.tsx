"use client";

import api from "@/lib/services/client";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import { DataTable } from "../collections/[cid]/components/data-table";
import TableSkeleton from "../collections/[cid]/components/table-skeleton";
import { CreateVenueModal } from "./forms/CreateVenueModal";
import { EditVenueModal } from "./forms/EditVenueModal";
import { ColumnDef } from "@tanstack/react-table";
import { config } from "@/config/app.config";
import { findCollectionById } from "@/helpers/findCollectionById";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { setCollection } from "@/redux/collectionSlice";
import { Dispatch } from "@reduxjs/toolkit";
import {
    selectCurrentPage,
    selectLimit,
    selectTotal,
    setCurrentPage,
    setLimit,
    setTotal
} from "@/redux/appSlice";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { PERMISSIONS } from "@/config/permissions.config";
import { MapPin } from "lucide-react";

export default function VenuesPage() {
    const [data, setData] = useState<Models.Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [selectedVenue, setSelectedVenue] = useState<Models.Document | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { hasPermission, isLoading: permissionsLoading } = usePermissions();
    const router = useRouter();
    const { toast } = useToast();
    const dispatch: Dispatch = useAppDispatch();

    const total = useAppSelector(selectTotal);
    const limit = useAppSelector(selectLimit);
    const currentPage = useAppSelector(selectCurrentPage);

    const fetchVenues = async () => {
        try {
            setTableLoading(true);
            const res = await api.getDocuments(
                config.venuesCollectionId,
                limit,
                (currentPage - 1) * limit
            );
            setData(res.documents);
            dispatch(setTotal(res.total));
        } catch (error: any) {
            console.error("Error fetching venues:", error);
            toast({
                title: "Error",
                description: "Could not load venues list.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };

    const columns: ColumnDef<Models.Document>[] = [
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => <code className="text-xs font-mono bg-muted px-1 rounded">{row.original.code}</code>
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? "default" : "secondary"}>
                    {row.original.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            accessorKey: "address",
            header: "Address",
            cell: ({ row }) => <span className="text-xs text-muted-foreground truncate max-w-[200px] inline-block">{row.original.address || "—"}</span>
        }
    ];

    const handleRowClick = (venue: Models.Document) => {
        setSelectedVenue(venue);
        setIsEditOpen(true);
    };

    useEffect(() => {
        fetchVenues();
    }, [limit, currentPage]);

    useEffect(() => {
        const collection = findCollectionById(config.venuesCollectionId);
        if (collection) {
            dispatch(setCollection(collection));
        }

        return () => {
            dispatch(setTotal(0));
            dispatch(setCurrentPage(1));
            dispatch(setLimit(10));
        };
    }, []);

    useEffect(() => {
        if (!permissionsLoading && !hasPermission(PERMISSIONS.KENO.VENUES_READ)) {
            router.replace("/app");
            toast({
                title: "Unauthorized",
                description: "You do not have permission to view this page.",
                variant: "destructive",
            });
        }
    }, [permissionsLoading, hasPermission, router]);

    if (permissionsLoading) return <TableSkeleton />;
    if (!hasPermission(PERMISSIONS.KENO.VENUES_READ)) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-3">
                        <MapPin size={24} className="text-primary" />
                        Venues
                        <span className="text-xs bg-muted p-1 px-2 font-normal text-foreground rounded-full">
                            {total} Documents
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Manage physical locations and ticket sales points. Click a row to edit.
                    </p>
                </div>
                <CreateVenueModal onSuccess={fetchVenues} />
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <DataTable
                    loading={tableLoading}
                    hideAddButton={true}
                    columns={columns}
                    data={data}
                    searchColumn="name"
                    pagination={true}
                    onRowClick={handleRowClick}
                />
            )}

            <EditVenueModal
                venue={selectedVenue}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={fetchVenues}
            />
        </div>
    );
}
