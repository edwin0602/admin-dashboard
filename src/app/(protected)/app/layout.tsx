import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import Sidebar from "./components/sidebar/Sidebar";
import DashboardHeader from "./components/header/Header";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row w-screen h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <DashboardHeader />
        <ScrollArea className="flex-1 w-full">
          <div className="p-4 md:p-7 py-3">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DashboardLayout;
