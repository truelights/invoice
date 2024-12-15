import { Inter } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Billing System || SoftFlow Solutions",
  description: "Complete billing system for managing invoices and transactions",
};

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="shortcut icon"
          href="/soft-flow-logo-10.png"
          type="image/x-icon"
        />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <nav className="border-b">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
              <div className="flex gap-4">
                <Link href="/invoice-/invoice">
                  <Button variant="ghost">Bills</Button>
                </Link>
                <Link href="/invoice-/transactions">
                  <Button variant="ghost">Transactions</Button>
                </Link>
                <Link href="/invoice-/reports">
                  <Button variant="ghost">Reports</Button>
                </Link>
                <Link href="/invoice-/settings">
                  <Button variant="ghost">Settings</Button>
                </Link>
              </div>
            </div>
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
