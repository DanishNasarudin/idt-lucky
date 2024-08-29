import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import Lucky from "./(sections)/Lucky";
import LuckyCounter from "./(sections)/LuckyCounter";

const inter = Inter({ subsets: ["latin"] });

export default async function Home() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }
  return (
    <main className={`${inter.className} flex flex-col mx-auto`}>
      {/* <section className="h-[80px]"></section> */}
      {/* <Hero /> */}
      <LuckyCounter />
      <Lucky />
      <Toaster richColors theme="dark" />
      {/* <Terms /> */}
    </main>
  );
}
