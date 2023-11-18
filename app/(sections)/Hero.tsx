import Link from "next/link";

type Props = {};

function Hero({}: Props) {
  return (
    <div className="max-w-none sm:max-w-[1060px] mx-auto w-full py-16">
      <div className="w-full sm:w-4/5 mx-auto px-4 sm:px-0 flex items-center flex-col sm:flex-row text-center sm:text-left">
        <div className="w-4/5">
          <h1 className="my-2 xs:my-4 leading-9">
            Ideal Tech Official <br />
            Lucky Draw
          </h1>
          <p className="hidden sm:block">
            You have found the hidden lucky draw. <br />
            <b className="font-normal text-accent">Calm yourself</b>, and try
            your best to get amazing offers.
          </p>
          <p className="sm:hidden">
            You have found the hidden lucky draw.{" "}
            <b className="font-normal text-accent">Calm yourself</b>, and try
            your best to get amazing offers.
          </p>
          <Link href={"#idt_lucky"}>
            <button
              className="
          relative z-[1] bg-accent/0 border-[1px] py-2 px-4 rounded-lg my-8 font-bold
          mobilehover:hover:bg-accent mobilehover:hover:text-black mobilehover:hover:border-transparent transition-all"
            >
              <p>Try your luck!</p>
            </button>
          </Link>
        </div>
        <div className="">
          <img
            src="https://idealtech.com.my/wp-content/uploads/2023/03/Artboard-26-1.png"
            alt="hero-graphic"
            className="
          w-60 py-8
          xs:py-0 xs:w-80"
          />
        </div>
      </div>
    </div>
  );
}

export default Hero;
