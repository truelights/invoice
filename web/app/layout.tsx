import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
const inter = Inter({ subsets: ["latin"] });
import "./globals.css"
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
