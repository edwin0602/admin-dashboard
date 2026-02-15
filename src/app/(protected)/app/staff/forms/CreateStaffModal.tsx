"use client";

import api from "@/appwrite/appwrite.client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Info, Loader2, UserPlus } from "lucide-react";
import { ID } from "appwrite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    role: z.enum(["user", "admin"]),
});

interface CreateStaffModalProps {
    onSuccess: () => void;
}

export function CreateStaffModal({ onSuccess }: CreateStaffModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const staffCID = config.collections.find((c) => c.name === "Staff")?.collectionId || "";

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            role: "user",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!staffCID) return;
        setIsLoading(true);
        try {
            await api.createStaff({
                ...values,
                collectionId: staffCID,
                databaseId: config.databaseId
            });

            toast({
                title: "Staff Created Successfully",
                description: `Staff member ${values.fullName} has been registered.`,
            });

            try {
                await api.createRecovery(values.email);
                toast({
                    title: "Invitation Sent",
                    description: "An activation email has been sent.",
                });
            } catch (recoveryError) {
                // Background action failure doesn't block UI
            }

            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error: any) {
            toast({
                title: "Error Creating Staff",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus size={16} className="mr-2" />
                    Add Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Staff</DialogTitle>
                    <DialogDescription>
                        Add a new staff member. This will automatically create an Appwrite account and send an invitation.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" {...field} />
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
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 234 567 890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
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
                        <div className="flex items-start gap-3 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs shadow-sm">
                            <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
                            <div className="space-y-1">
                                <p className="font-semibold">Automated Process</p>
                                <p>An Appwrite User will be created automatically. Verify the email as the Magic Link will be sent there.</p>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Staff & Invite
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
