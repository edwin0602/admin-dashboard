"use client";

import api from "@/appwrite/appwrite.client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

  const FormSchema = z.object({
    email: z.string().email({
      message: "Please enter a valid email.",
    }),
    password: z.string().min(8, {
      message: "Password must be 8 characters or more.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    try {
      await api.createSession(data);
      const user = await api.getAccount();

      // 1. Email Verification Check
      if (!user.emailVerification) {
        await api.deleteCurrentSession();
        toast({
          title: "Email not verified",
          variant: "destructive",
          description: "Please verify your email before logging in.",
        });
        setIsLoading(false);
        return;
      }

      // 2. Staff Status Check
      const status = await api.getStaffStatus(user.$id);
      if (status === "INACTIVE" || status === "BANNED") {
        await api.deleteCurrentSession();
        const message = status === "BANNED"
          ? "Your account has been banned. Please contact support."
          : "Your account is inactive. Please contact an administrator.";
        toast({
          title: "Access Denied",
          variant: "destructive",
          description: message,
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login Successful",
        description: "Redirecting you to dashboard...",
      });
      router.replace("/app");
    } catch (err: any) {
      toast({
        title: "Can't login",
        variant: "destructive",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
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

          <div className="flex justify-end">
            <Button variant="link" size="sm" asChild className="px-0 font-normal">
              <Link href="/forgot-password">Forgot password?</Link>
            </Button>
          </div>

          <Button disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proceed
          </Button>
        </form>
      </Form>
    </div>
  );
}
