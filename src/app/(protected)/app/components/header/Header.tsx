"use client";

import SearchCommandBox from "@/components/shared/SearchCommandBox";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getShortcutKey } from "@/helpers/getShortcutKey";
import { ToggleTheme } from "@/theme/ToggleTheme";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Keyboard, LogOut, Loader2, User, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadCrumb from "./BreadCrumb";
import { logout, getSession } from "@/lib/services/auth.service";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SidebarNavs from "../sidebar/SidebarNavs";
import Logo from "@/components/shared/Logo";
import { config } from "@/config/app.config";

const DashboardHeader = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchBoxOpen, setSearchBoxOpen] = useState(false);
  const [firstName, setFirstName] = useState<string>("");
  const searchBoxShortcutKey: string = getShortcutKey("searchbox");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getSession();
        if (user && user.name) {
          setFirstName(user.name.split(" ")[0]);
        }
      } catch (error) {
        console.error("Error fetching user session for header:", error);
      }
    };
    fetchUser();

    const down = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === searchBoxShortcutKey) {
        e.preventDefault();
        setSearchBoxOpen((searchBoxOpen) => !searchBoxOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return (
    <header className="flex sticky top-0 items-center justify-between px-4 md:px-7 py-2 border-b bg-background/95 backdrop-blur">
      <SearchCommandBox open={searchBoxOpen} setOpen={setSearchBoxOpen} />
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
              <div className="top px-4 py-4 flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <Logo className="w-[44px] h-[44px]" />
                  <h2 className="text-sm font-semibold text-secondary-foreground">
                    {config.projectName}
                  </h2>
                </div>
                <SidebarNavs />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:block">
          <BreadCrumb />
        </div>
      </div>
      <div className="right flex items-center gap-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/docs"
        >
          Docs
        </Link>
        <Keyboard size={15} />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setSearchBoxOpen(true)}
                variant="ghost"
                size="sm"
                className="rounded-full p-0 w-[34px] h-[34px]"
              >
                <MagnifyingGlassIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ctrl + {searchBoxShortcutKey}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ToggleTheme />
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none flex items-center gap-2 hover:bg-muted p-1 rounded-md transition-colors">
            {firstName && (
              <span className="text-sm font-medium mr-1">{firstName}</span>
            )}
            <Avatar className="w-[30px] h-[30px] bg-muted border border-secondary-foreground/10">
              <img
                src="https://vercel.com/api/www/avatar/OGtI6p0A6Ct2GNVzrW7zqPgN?&s=160"
                alt=""
              />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/app/profile" className="flex items-center">
                <User size={14} className="mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : (
                <LogOut size={14} className="mr-2" />
              )}
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
