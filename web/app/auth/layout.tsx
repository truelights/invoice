import { Inter } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Billing System || SoftFlow Solutions",
  description: "Complete billing system for managing invoices and transactions",
};

export default function AuthLayout({
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
                <Link href="/">
                  <Button variant="ghost">Home</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="ghost">Register</Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
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
