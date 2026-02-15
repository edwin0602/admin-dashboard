"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { config } from "@/config/app.config";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      {/* Background Decorative Elements */}
      <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />

      <div className="z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <h1 className="select-none text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground/20 to-foreground/5 dark:from-foreground/10 dark:to-transparent sm:text-[18rem]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold tracking-widest text-foreground/80 mix-blend-difference sm:text-4xl">
              PAGE NOT FOUND
            </span>
          </div>
        </div>

        <div className="max-w-[460px] space-y-4">
          <p className="text-lg text-muted-foreground sm:text-xl">
            Sorry, the resource you are looking for does not exist or has been moved to another location.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="default" size="lg" className="h-12 px-8">
            <Link href="/app" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 text-sm text-muted-foreground/50">
        © {new Date().getFullYear()} {config.projectName}. All rights reserved.
      </div>
    </div>
  );
}
