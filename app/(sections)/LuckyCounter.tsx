"use client";
import { useSocket } from "@/lib/providers/socket-provider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { readDataClient } from "../(serverActions)/manageJSON";

type Props = {};

type PrizeFormat = {
  count: number;
};

type PrizeArray = {
  prizes: PrizeFormat[];
};

const initialPrizeState: PrizeArray = {
  prizes: [
    {
      count: 0,
    },
  ],
};

const LuckyCounter = (props: Props) => {
  const { socket } = useSocket();
  // const [initialPrizes, setPrizes] = useState<PrizeArray>(initialPrizeState);
  // const dataPrize = initialPrizes.prizes;
  const [prizeClaimed, setPrizeClaimed] = useState(0);
  const [prizeAvailable, setPrizeAvailable] = useState(0);

  // console.log(dataPrize.reduce((acc, current) => acc + current.count, 0));

  useEffect(() => {
    // Function to fetch and update data
    if (socket === null) return;

    const fetchData = () => {
      readDataClient("common").then(({ countAvailable, countsClaimed }) => {
        setPrizeAvailable(countAvailable);
        setPrizeClaimed(countsClaimed);
      });
    };

    // Initial fetch
    fetchData();

    socket.on("refetch-data", fetchData);

    // Set up an interval for re-fetching data every 10 minutes
    const interval = setInterval(fetchData, 600000); // 600000 ms = 10 minutes

    // Clean up interval on component unmount
    return () => {
      clearInterval(interval);
      socket.off("refetch-data", fetchData);
    };
  }, [socket]);

  const getColorClass = (value: number): string => {
    if (value <= 25) {
      return "text-red-500 bg-red-500"; // Red for values 10 or less
    } else if (value <= 100) {
      return "text-yellow-500 bg-yellow-500"; // Yellow for values between 11 and 50
    } else if (value <= 250) {
      return "text-green-500 bg-green-500";
    } else {
      return "text-white bg-white"; // Green for values above 50
    }
  };

  return (
    <div className="max-w-none sm:max-w-[1060px] mx-auto w-full py-8">
      <div className="w-full sm:w-4/5 mx-auto px-4 sm:px-0 flex flex-col items-center gap-6">
        <div className="flex flex-col item-center text-center">
          <h2>Prize Counter</h2>
          <p>Grab them fast before they run out!</p>
        </div>
        {/* <div className="box-container max-w-[500px] w-full mx-auto text-center border-[1px] border-zinc-800 rounded-md">
          <div className="row-head flex py-2">
            <div className="w-full border-r-[1px] border-zinc-800 px-[2px]">
              RM 1,000
            </div>
            <div className="w-full border-r-[1px] border-zinc-800 px-[2px]">
              RM 500
            </div>
            <div className="w-full border-r-[1px] border-zinc-800 px-[2px]">
              RM 300
            </div>
            <div className="w-full border-r-[1px] border-zinc-800 px-[2px]">
              RM 100
            </div>
            <div className="w-full px-[2px]">RM 50</div>
          </div>

          <div className="row flex border-t-[1px] border-zinc-800 py-2">
            {initialPrizes &&
              dataPrize.slice(0, dataPrize.length - 1).map((data, index) => {
                return (
                  <div
                    key={index}
                    className="w-full border-r-[1px] border-zinc-800 px-[2px]"
                  >
                    {data.count}
                  </div>
                );
              })}
            {initialPrizes &&
              dataPrize
                .slice(dataPrize.length - 1, dataPrize.length)
                .map((data, index) => {
                  return (
                    <div key={index} className="w-full px-[2px]">
                      {data.count}
                    </div>
                  );
                })}
          </div>
        </div> */}
        <div className="flex w-full text-center">
          <div className="w-full flex flex-col items-center">
            <div className="flex">
              <span
                className={cn(
                  "absolute flex border blur-xl bg-clip-text text-[80px] box-content font-extrabold text-transparent text-center select-none",
                  getColorClass(prizeAvailable)
                )}
              >
                {prizeAvailable}
              </span>
              <h1
                className={cn(
                  "relative justify-center flex items-center bg-clip-text text-[80px] font-extrabold text-transparent text-center select-auto",
                  getColorClass(prizeAvailable)
                )}
              >
                {prizeAvailable}
              </h1>
            </div>
            <h2>Prizes Available</h2>
          </div>
          <div className="w-full">
            <h1 className="text-[80px]">{prizeClaimed}</h1>
            <h2>Prizes Claimed</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyCounter;
