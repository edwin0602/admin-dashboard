"use client";

import api from "@/lib/services/client";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";

interface ForgotPasswordFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ForgotPasswordForm({ className, ...props }: ForgotPasswordFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const { toast } = useToast();

    const FormSchema = z.object({
        email: z.string().email({
            message: "Please enter a valid email.",
        }),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true);
        try {
            await api.createRecovery(data.email);
            setIsSubmitted(true);
            toast({
                title: "Recovery email sent",
                description: "Please check your inbox for instructions to reset your password.",
            });
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

    if (isSubmitted) {
        return (
            <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to your email.
                </p>
                <Button variant="link" asChild>
                    <Link href="/login">Back to Login</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isLoading}
                                        placeholder="name@example.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Recovery Email
                    </Button>

                    <div className="text-center">
                        <Button variant="link" size="sm" asChild>
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}


