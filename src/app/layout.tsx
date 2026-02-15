import { ThemeProvider } from "@/theme/ThemeProvider";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { config } from "@/config/app.config";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: config.projectName,
  description: "Manage your project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
