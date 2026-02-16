"use client";

import api from "@/lib/services";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ResetPasswordFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ResetPasswordForm({ className, ...props }: ResetPasswordFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    const FormSchema = z.object({
        password: z.string().min(8, {
            message: "Password must be 8 characters or more.",
        }),
        confirmPassword: z.string().min(8, {
            message: "Password must be 8 characters or more.",
        }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        if (!userId || !secret) {
            toast({
                title: "Error",
                variant: "destructive",
                description: "Invalid or missing recovery token.",
            });
            return;
        }

        setIsLoading(true);
        try {
            await api.updateRecovery(userId, secret, data.password);
            toast({
                title: "Password reset successful",
                description: "Your password has been updated. You can now log in.",
            });
            router.replace("/login");
        } catch (err: any) {
            toast({
                title: "Error",
                variant: "destructive",
                description: err.message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (!userId || !secret) {
        return (
            <div className="text-center p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
                Invalid or missing reset token. Please request a new link.
            </div>
        );
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isLoading}
                                        type="password"
                                        placeholder="********"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isLoading}
                                        type="password"
                                        placeholder="********"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reset Password
                    </Button>
                </form>
            </Form>
        </div>
    );
}
