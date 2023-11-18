import { Inter } from "next/font/google";
import Hero from "./(sections)/Hero";
import Lucky from "./(sections)/Lucky";
import Terms from "./(sections)/Terms";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={`${inter.className} flex flex-col mx-auto`}>
      {/* <section className="h-[80px]"></section> */}
      <Hero />
      <Lucky />
      <Terms />
    </main>
  );
}
