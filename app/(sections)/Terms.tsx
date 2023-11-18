import React from "react";

type Props = {};

const Terms = (props: Props) => {
  return (
    <div className="max-w-none sm:max-w-[1060px] mx-auto w-full py-16">
      <div className="w-full sm:w-4/5 mx-auto px-4 sm:px-0 leading-loose">
        <h2 className="pb-2">Terms & Conditions</h2>
        <p className="border-t-[1px] border-zinc-800 py-1">
          1. You are required to{" "}
          <b className="text-accent">purchase a PC from Ideal Tech</b> in order
          to play the Lucky Draw.
        </p>
        <p className="border-t-[1px] border-zinc-800 py-1">
          2. The Lucky Draw is only{" "}
          <b className="text-accent">valid between 2nd to 3rd December 2023</b>.
        </p>
        <p className="border-t-[1px] border-zinc-800 py-1">
          3. You can only draw 1 time. You can get the validation code from
          Ideal Tech PC during your purchase.
        </p>
        <p className="border-t-[1px] border-zinc-800 py-1">
          4. You will receive an email if you successfully won a prize,
          screenshot the email and send to Ideal Tech PC during your purchase.
        </p>
      </div>
    </div>
  );
};

export default Terms;
