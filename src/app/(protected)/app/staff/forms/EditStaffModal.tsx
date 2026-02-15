"use client";

import api from "@/appwrite/appwrite.client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { config } from "@/config/app.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Ban, CheckCircle2, Loader2, Mail, ShieldAlert, UserCog } from "lucide-react";
import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
    role: z.enum(["user", "admin"]),
    status: z.enum(["ACTIVE", "INACTIVE", "BANNED"]),
});

interface EditStaffModalProps {
    staff: Models.Document | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditStaffModal({ staff, open, onOpenChange, onSuccess }: EditStaffModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const { toast } = useToast();

    const staffCID = config.collections.find((c) => c.name === "Staff")?.collectionId || "";

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            role: "user",
            status: "ACTIVE",
        },
    });

    useEffect(() => {
        if (staff) {
            form.reset({
                fullName: staff.fullName || "",
                phone: staff.phone || "",
                role: staff.role || "user",
                status: staff.status || "ACTIVE",
            });
        }
    }, [staff, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!staff || !staffCID) return;
        setIsLoading(true);
        try {
            await api.updateStaff({
                userId: staff.userId,
                documentId: staff.$id,
                collectionId: staffCID,
                databaseId: config.databaseId,
                ...values,
            });

            toast({
                title: "Staff Updated",
                description: `${values.fullName}'s information has been updated.`,
            });

            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResetPassword() {
        if (!staff?.email) return;
        setIsResettingPassword(true);
        try {
            await api.createRecovery(staff.email);
            toast({
                title: "Password Reset Sent",
                description: `An invitation/recovery email has been sent to ${staff.email}.`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send reset email.",
                variant: "destructive",
            });
        } finally {
            setIsResettingPassword(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-primary" />
                        Edit Staff Member
                    </DialogTitle>
                    <DialogDescription>
                        Update details for {staff?.fullName}.
                        Changes to status will affect their account access.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={
                                                    field.value === "ACTIVE" ? "text-green-600" :
                                                        field.value === "BANNED" ? "text-red-600" : "text-amber-600"
                                                }>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE" className="text-green-600">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4" /> Active
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="INACTIVE" className="text-amber-600">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4" /> Inactive
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="BANNED" className="text-red-600">
                                                    <div className="flex items-center gap-2">
                                                        <Ban className="h-4 w-4" /> Banned
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-4 space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium">Security</p>
                                    <p className="text-xs text-muted-foreground">Send password reset email</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetPassword}
                                    disabled={isResettingPassword}
                                >
                                    {isResettingPassword ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Staff
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
