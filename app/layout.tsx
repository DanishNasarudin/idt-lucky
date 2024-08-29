import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Footer from "./(components)/Footer";
import "./globals.css";

import { SocketProvider } from "@/lib/providers/socket-provider";
import { getServerSession } from "next-auth";
import SessionProvider from "./(components)/SessionProvider";

const Navbar = dynamic(() => import("./(components)/Navbar"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ideal Tech PC Lucky Draw",
  description: "Try your luck through Ideal Tech PC Lucky Draw.",
  keywords: ["Ideal Tech", "Custom PC", "Lucky Draw", "Luck", "Package PC"],
  icons: {
    icon: "/icon?<generated>",
  },
  openGraph: {
    title: "Ideal Tech PC Lucky Draw",
    description: "Try your luck through Ideal Tech PC Lucky Draw.",
    images: [
      {
        url: "https://idealtech.com.my/wp-content/uploads/2023/07/01_Artwork-PC.png",
        width: 1000,
        height: 1000,
        alt: "Ideal Tech Custom PC",
      },
      {
        url: "https://idealtech.com.my/wp-content/uploads/2023/03/IDT_LOGO-150x150.png",
        width: 1000,
        height: 1000,
        alt: "Ideal Tech Gaming PC",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body className={`${inter.className} relative`}>
        <SessionProvider session={session}>
          <SocketProvider>
          <Navbar />
          <div className="mx-auto">{children}</div>
          <div className="h-[30vh]"></div>
          <Footer />
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
