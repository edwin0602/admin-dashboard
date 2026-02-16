import { config } from "@/config/app.config";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const BreadCrumb = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((item) => item !== "" && item !== "app");

  const getLabel = (segment: string) => {
    // Check if it's a collection ID
    const collection = config.collections.find((c) => c.collectionId === segment);
    if (collection) return collection.name;

    // Capitalize other segments
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link href="/app" className="hover:text-foreground transition-colors">
        App
      </Link>
      {segments.map((segment, index) => {
        const href = `/app/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} className="text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{getLabel(segment)}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors"
              >
                {getLabel(segment)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BreadCrumb;


