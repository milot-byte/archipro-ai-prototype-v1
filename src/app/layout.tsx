import type { Metadata } from "next";
import "@/styles/globals.css";
import { Sidebar } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "ArchiPro — Architecture Intelligence Platform",
  description: "Your logged-in architecture workspace — projects, boards, specs, and intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <Sidebar />
        <main className="ml-[240px] flex-1 min-h-screen bg-background transition-all duration-200">
          {children}
        </main>
      </body>
    </html>
  );
}
