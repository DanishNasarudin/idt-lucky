import { Inter } from "next/font/google";
import Hero from "./(sections)/Hero";
import Lucky from "./(sections)/Lucky";
import LuckyCounter from "./(sections)/LuckyCounter";
import Terms from "./(sections)/Terms";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={`${inter.className} flex flex-col mx-auto`}>
      {/* <section className="h-[80px]"></section> */}
      <Hero />
      <LuckyCounter />
      <Lucky />
      <Terms />
    </main>
  );
}
