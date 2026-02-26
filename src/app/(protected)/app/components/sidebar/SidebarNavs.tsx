"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { config } from "@/config/app.config";
import { LayoutDashboard, User, Settings, MapPin, Home, Component, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/config/permissions.config";

interface NavInterface {
  name: string;
  icon: React.ReactNode;
  link: string;
}

const SidebarNavs: React.FC = () => {
  const pathname: string = usePathname();
  const { hasPermission } = usePermissions();

  const navs: NavInterface[] = [
    {
      name: "Overview",
      icon: <Home size={14} />,
      link: "/app",
    }
  ];

  // Add Staff link if user has STAFF_READ permission
  if (hasPermission(PERMISSIONS.STAFF.READ)) {
    navs.push({
      name: "Staff",
      icon: <User size={14} />,
      link: "/app/staff",
    });
  }

  // Add Venues link
  if (hasPermission(PERMISSIONS.KENO.VENUES_READ)) {
    navs.push({
      name: "Venues",
      icon: <MapPin size={14} />,
      link: "/app/venues",
    });
  }

  return (
    <nav className="py-8 w-full rounded-xl flex flex-col gap-1">
      {navs.map((nav, i) => (
        <Link
          key={i}
          href={nav.link}
          className={`flex w-full items-center text-sm transition-all ${pathname === nav.link
            ? "bg-muted text-primary"
            : "text-muted-foreground"
            } hover:bg-muted rounded-md gap-2 p-1.5 px-2`}
        >
          {nav.icon}
          <span className="text-sm">{nav.name}</span>
        </Link>
      ))}
      {config.groups.map((group, i) => (
        <Accordion
          key={i}
          type="single"
          collapsible
          className="w-full pl-2 p-1.5"
        >
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger
              style={{ padding: "0px", paddingBottom: "0px" }}
            >
              <p className="flex items-center text-muted-foreground gap-2 text-sm">
                <Component size={14} />
                {group.name}
              </p>
            </AccordionTrigger>
            <AccordionContent className="pl-1">
              {config.collections
                .filter((c) => c.groupId === group.id)
                .map((collection: any, i: number) => (
                  <Link
                    key={i}
                    href={`/app/collections/${collection.collectionId}`}
                    className={`flex w-full items-center text-sm transition-all ${pathname ===
                      `/app/collections/${collection.collectionId}`
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                      } hover:bg-muted rounded-md gap-2 mb-1 p-1.5 px-1`}
                  >
                    <FileText size={14} />
                    <span className="text-sm">{collection.name}</span>
                  </Link>
                ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}

      {config.collections
        .filter((c) => !c.groupId)
        .map((collection, i) => (
          <Link
            key={i}
            href={`/app/collections/${collection.collectionId}`}
            className={`flex w-full items-center text-sm transition-all ${pathname === `/app/collections/${collection.collectionId}`
              ? "bg-muted text-primary"
              : "text-muted-foreground"
              } hover:bg-muted rounded-md gap-2 p-1.5 px-2`}
          >
            <FileText size={14} />
            <span className="text-sm">{collection.name}</span>
          </Link>
        ))}

      {hasPermission(PERMISSIONS.CONFIG.READ) && (
        <Link
          key={"settings"}
          href={"/app/settings"}
          className={`flex w-full items-center text-sm transition-all ${pathname === "/app/settings"
            ? "bg-muted text-primary"
            : "text-muted-foreground"
            } hover:bg-muted rounded-md gap-2 p-1.5 px-2`}
        >
          <Settings size={14} />
          <span className="text-sm">Settings</span>
        </Link>
      )}
    </nav>
  );
};

export default SidebarNavs;


