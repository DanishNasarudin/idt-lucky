"use client";
import React, { useEffect, useState } from "react";
import { readData, readDataClient } from "../(serverActions)/manageJSON";

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
  const [initialPrizes, setPrizes] = useState<PrizeArray>(initialPrizeState);
  const dataPrize = initialPrizes.prizes;
  // console.log(initialPrizes);

  useEffect(() => {
    // Function to fetch and update data

    const fetchData = () => {
      readDataClient("common").then((data) => {
        setPrizes({ ...initialPrizes, prizes: data });
      });
    };

    // Initial fetch
    fetchData();

    // Set up an interval for re-fetching data every 10 minutes
    const interval = setInterval(fetchData, 600000); // 600000 ms = 10 minutes

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-none sm:max-w-[1060px] mx-auto w-full py-8">
      <div className="w-full sm:w-4/5 mx-auto px-4 sm:px-0 flex flex-col items-center gap-6">
        <div className="flex flex-col item-center text-center">
          <h2>Prize Counter</h2>
          <p>Grab them fast before they run out!</p>
        </div>
        <div className="box-container max-w-[500px] w-full mx-auto text-center border-[1px] border-zinc-800 rounded-md">
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
        </div>
      </div>
    </div>
  );
};

export default LuckyCounter;
