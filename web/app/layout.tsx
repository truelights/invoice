import { Inter } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthCheck from "@/components/auth/AuthCheck";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Billing System || SoftFlow Solutions",
  description: "Complete billing system for managing invoices and transactions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="shortcut icon" href="/soft-flow-logo-10.png" type="image/x-icon" />
      <body className={inter.className}>
        <AuthProvider>
          <AuthCheck>
            <nav className="border-b">
              <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <div className="flex gap-4">
                  <Link href="/">
                    <Button variant="ghost">Bills</Button>
                  </Link>
                  <Link href="/transactions">
                    <Button variant="ghost">Transactions</Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="ghost">Reports</Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="ghost">Settings</Button>
                  </Link>
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost">Logout</Button>
                </div>
              </div>
            </nav>
            {children}
          </AuthCheck>
        </AuthProvider>
      </body>
    </html>
  );
}
