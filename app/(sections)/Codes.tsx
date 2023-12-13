"use client";
import React, { useRef, useState, useEffect, RefObject } from "react";
import {
  copiedCodeAdmin,
  readAllDataCodes,
  readData,
} from "../(serverActions)/manageJSON";
import { useSession, signOut } from "next-auth/react";
import { io } from "socket.io-client";

const hostname =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:5051"
    : `https://luckysocket.idealtech.com.my`;

const socket = io(`${hostname}`);

type Props = {};

type DataFormat = {
  code: string;
  email: string | null;
  used: boolean;
  copied: boolean;
};

type PrizeFormat = {
  id: number;
  name: string;
  claimed: boolean;
  winnerEmail: string[];
  count: number;
};

type PrizeArray = {
  prizes: PrizeFormat[];
};
type DataArray = {
  codes: DataFormat[];
};

const initialPrizeState: PrizeArray = {
  prizes: [
    {
      id: 0,
      name: "",
      claimed: false,
      winnerEmail: [],
      count: 0,
    },
  ],
};
const initialCodeState: DataArray = {
  codes: [
    {
      code: "",
      email: null,
      used: false,
      copied: false,
    },
  ],
};

const Codes = (props: Props) => {
  const { data: session } = useSession();
  const [initialPrizes, setPrizes] = useState<PrizeArray>(initialPrizeState);
  const [initialCodes, setCodes] = useState<DataArray>(initialCodeState);
  const data = initialCodes.codes;
  const dataPrize = initialPrizes.prizes;
  const [buttonAction, setButtonAction] = useState(false);
  // const [copiedEmail, setCopiedEmail] = useState(false);
  // console.log(initialPrizes);

  useEffect(() => {
    // Function to fetch and update data

    const fetchData = () => {
      setButtonAction(true);
      readData("common")
        .then((data) => {
          setPrizes({ ...initialPrizes, prizes: data.prizes });
        })
        .then(() =>
          readAllDataCodes().then((data) => {
            setCodes({ ...initialCodes, codes: data });
          })
        )
        .then(() => setButtonAction(false));
    };

    // Initial fetch
    fetchData();

    // Set up an interval for re-fetching data every 1 minutes
    const interval = setInterval(fetchData, 60000); // 60000 ms = 1 minutes

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    setButtonAction(true);
    readData("common")
      .then((data) => {
        setPrizes({ ...initialPrizes, prizes: data.prizes });
      })
      .then(() =>
        readAllDataCodes().then((data) => {
          setCodes({ ...initialCodes, codes: data });
        })
      )
      .then(() => setButtonAction(false));
  };

  const columnSize = 24;
  const columnSizePrize = 55;

  type ButtonPress = {
    codeCopied: string;
  };

  useEffect(() => {
    socket.on("button-copy", ({ codeCopied }: ButtonPress) => {
      if (codeCopied === "") return;
      setCodes((currentCodes) => {
        return {
          ...currentCodes,
          codes: currentCodes.codes.map((code) =>
            code.code === codeCopied ? { ...code, copied: true } : code
          ),
        };
      });
    });
    socket.on("button-reset", ({ codeCopied }: ButtonPress) => {
      if (codeCopied === "") return;
      setCodes((currentCodes) => {
        return {
          ...currentCodes,
          codes: currentCodes.codes.map((code) =>
            code.code === codeCopied ? { ...code, copied: false } : code
          ),
        };
      });
    });

    // socket.off("button-copy");
    // socket.off("button-reset");
  }, []);

  const handleCodeCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // event.preventDefault();

    const codeValue = event.currentTarget.value;

    socket.emit("button-copy", { codeCopied: codeValue });

    // Optimistically update the state
    setCodes((currentCodes) => {
      return {
        ...currentCodes,
        codes: currentCodes.codes.map((code) =>
          code.code === codeValue ? { ...code, copied: true } : code
        ),
      };
    });
    navigator.clipboard.writeText(codeValue);
    // console.log(event.currentTarget.value);
    try {
      const updatedCode = await copiedCodeAdmin(
        event.currentTarget.value,
        true,
        "common"
      );
      setCodes((currentCodes) => {
        const newCodes = currentCodes.codes.map((code) =>
          code.code === updatedCode.code ? updatedCode : code
        );
        return { ...currentCodes, codes: newCodes };
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleResetCopy = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    // event.preventDefault();

    const codeValue = event.currentTarget.value;

    socket.emit("button-reset", { codeCopied: codeValue });

    // Optimistically update the state
    setCodes((currentCodes) => {
      return {
        ...currentCodes,
        codes: currentCodes.codes.map((code) =>
          code.code === codeValue ? { ...code, copied: false } : code
        ),
      };
    });
    // console.log(event.currentTarget.value);
    try {
      const updatedCode = await copiedCodeAdmin(
        event.currentTarget.value,
        false,
        "common"
      );
      setCodes((currentCodes) => {
        const newCodes = currentCodes.codes.map((code) =>
          code.code === updatedCode.code ? updatedCode : code
        );
        return { ...currentCodes, codes: newCodes };
      });
    } catch (e) {
      console.log(e);
    }
  };
  const [buttonRefs, setButtonRefs] = useState<RefObject<HTMLButtonElement>[]>(
    []
  );
  const [buttonRefsCode, setButtonRefsCode] = useState<
    RefObject<HTMLButtonElement>[]
  >([]);
  // console.log(buttonRefs, "check");

  useEffect(() => {
    // Assign a ref for each item in your data array
    setButtonRefs(dataPrize.map((_) => React.createRef<HTMLButtonElement>()));
    setButtonRefsCode(data.map((_) => React.createRef<HTMLButtonElement>()));
  }, [dataPrize, data]);

  // dataPrize, data

  // console.log(data);

  const handleCopyEmailHidden = (event: number, section: string) => {
    const buttonRef = buttonRefs[event];
    const buttonRefCode = buttonRefsCode[event];
    // console.log(buttonRefs, "check");
    if (section === "code") {
      if (buttonRefCode && buttonRefCode.current) {
        buttonRefCode.current.click();
      }
    } else {
      if (buttonRef && buttonRef.current) {
        buttonRef.current.click();
      }
    }
  };

  const handleCopyEmail = (event: number, section: string) => {
    // setCopiedEmail(true);
    // setTimeout(() => {
    //   setCopiedEmail(false);
    // }, 1000);

    if (section === "code") {
      const buttonRefCode = buttonRefsCode[event];

      if (buttonRefCode && buttonRefCode.current) {
        const valueToCopy = buttonRefCode.current.value;
        navigator.clipboard.writeText(valueToCopy);
        // Additional logic for copy confirmation
      }
    } else {
      const buttonRef = buttonRefs[event];

      if (buttonRef && buttonRef.current) {
        // console.log(buttonRef.current.value, "check");
        const valueToCopy = buttonRef.current.value;
        navigator.clipboard.writeText(valueToCopy);
        // Additional logic for copy confirmation
      }
    }
  };

  const [buttonHighlightEmail, setButtonHighlightEmail] = useState<
    null | number
  >(null);
  const [buttonHighlightEmail2, setButtonHighlightEmail2] = useState<
    null | number
  >(null);

  const handleCopyHighEmail = (index: number) => {
    setButtonHighlightEmail((prev) => {
      return prev === index ? null : index;
    });
    setTimeout(() => {
      setButtonHighlightEmail(null);
    }, 2000);
  };
  const handleCopyHighEmail2 = (index: number) => {
    setButtonHighlightEmail2((prev) => {
      return prev === index ? null : index;
    });
    setTimeout(() => {
      setButtonHighlightEmail2(null);
    }, 2000);
  };

  return (
    <div className="max-w-none sm:max-w-[1060px] mx-auto w-full py-10 px-4 sm:px-0 flex flex-col gap-16">
      {/* <div>
        {initialPrizes &&
          data.map((data, index) => {
            return <div key={index}>{data.code}</div>;
          })}
      </div> */}
      <div className="w-full sm:w-4/5 mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p>Admin: {session?.user?.name}</p>
          <div className="flex gap-4 items-center">
            <button
              className="border-[1px] px-2 py-1 rounded-md border-zinc-800 text-zinc-600
              mobilehover:hover:border-zinc-500 mobilehover:hover:text-zinc-300"
              onClick={() => fetchData()}
            >
              {buttonAction ? <p>Loading data...</p> : <p>Refresh Data</p>}
            </button>
            <button
              className="border-[1px] px-2 py-1 rounded-md border-zinc-800 text-zinc-600
            mobilehover:hover:border-zinc-500 mobilehover:hover:text-zinc-300"
              onClick={() => signOut()}
            >
              <p>Sign Out</p>
            </button>
          </div>
        </div>
        <h2>Available Codes</h2>
        <div className="table-container">
          <div
            className={`head w-full flex py-1.5 items-center border-b-[1px] border-zinc-800
          ${initialCodes.codes.length > 10 ? `pr-[12px]` : ``}`}
          >
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSize - 5}%` }}
            >
              <p>Codes</p>
            </div>
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSize}%` }}
            >
              <p>Email</p>
            </div>
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSize - 5}%` }}
            >
              <p>Used</p>
            </div>
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSize - 5}%` }}
            >
              <p>Copied</p>
            </div>
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSize - 5}%` }}
            >
              <p>Copy</p>
            </div>
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSize - 5}%` }}
            >
              <p>Reset Copy</p>
            </div>
          </div>
          <div
            className={`body max-h-[370px] ${
              initialCodes.codes.length > 10 ? `overflow-y-scroll` : ``
            } `}
          >
            {initialCodes &&
              data.map((data, index) => {
                return (
                  <div
                    key={index}
                    className="rows w-full flex border-t-[1px] border-zinc-800 py-1.5 items-center"
                  >
                    <div
                      className={`px-1`}
                      style={{ width: `${columnSize - 5}%` }}
                    >
                      <p className="select-none">{data.code}</p>
                    </div>
                    <div
                      className="px-1 border-l-[1px] border-zinc-800 text-transparent"
                      style={{ width: `${columnSize}%` }}
                    >
                      .
                      <div
                        className={`relative overflow-x-clip mobilehover:hover:overflow-x-visible w-full cursor-pointer text-white`}
                      >
                        <p
                          className={`
                          ${
                            buttonHighlightEmail2 === index
                              ? "bg-green-500 mobilehover:hover:bg-green-400"
                              : "mobilehover:hover:bg-zinc-700"
                          }
                          absolute top-0 left-0 translate-y-[-90%] w-min  px-2 py-1 rounded-md
                          `}
                          onClick={() => {
                            handleCopyEmailHidden(index, "code");
                            handleCopyHighEmail2(index);
                          }}
                        >
                          {data.email != null ? data.email : "none"}
                        </p>
                      </div>
                      <button
                        className="hidden"
                        value={data.email != null ? data.email : "none"}
                        onClick={() => handleCopyEmail(index, "code")}
                        ref={buttonRefsCode[index]}
                      ></button>
                    </div>
                    <div
                      className={`px-1 border-l-[1px] border-zinc-800`}
                      style={{ width: `${columnSize - 5}%` }}
                    >
                      <p>{data.used ? `✅` : `⬜`}</p>
                    </div>
                    <div
                      className={`px-1 border-l-[1px] border-zinc-800`}
                      style={{ width: `${columnSize - 5}%` }}
                    >
                      <p>{data.copied ? `🟥` : `⬜`}</p>
                    </div>
                    <div
                      className={`px-1 border-l-[1px] border-zinc-800`}
                      style={{ width: `${columnSize - 5}%` }}
                    >
                      <button
                        className={`
                        
                        px-2 py-1 bg-zinc-700 mobilehover:hover:bg-zinc-600 rounded-md`}
                        value={data.code}
                        onClick={(e) => {
                          handleCodeCopy(e);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          style={{ fill: "rgba(255, 255, 255, 1)" }}
                        >
                          <path d="M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z"></path>
                        </svg>
                      </button>
                    </div>
                    <div
                      className={`px-1 border-l-[1px] border-zinc-800`}
                      style={{ width: `${columnSize - 5}%` }}
                    >
                      <button
                        className={`px-2 py-1 rounded-md
                        ${
                          data.used
                            ? "bg-zinc-800 mobilehover:hover:bg-zinc-700 fill-zinc-400"
                            : "bg-zinc-700 mobilehover:hover:bg-zinc-600 fill-white"
                        }`}
                        value={data.code}
                        disabled={data.used}
                        onClick={(e) => handleResetCopy(e)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 16c1.671 0 3-1.331 3-3s-1.329-3-3-3-3 1.331-3 3 1.329 3 3 3z"></path>
                          <path d="M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <div className="w-full sm:w-4/5 mx-auto flex flex-col gap-4">
        <h2>Available Prizes</h2>
        <div className="table-container">
          <div className="head w-full flex py-1.5 items-center border-b-[1px] border-zinc-800">
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSizePrize - 20}%` }}
            >
              <p>Codes</p>
            </div>
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSizePrize}%` }}
            >
              <p>Email</p>
            </div>
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSizePrize - 20}%` }}
            >
              <p>Full Claimed?</p>
            </div>
            <div
              className={`px-1 text-zinc-400`}
              style={{ width: `${columnSizePrize - 20}%` }}
            >
              <p>Prizes Left</p>
            </div>
          </div>
          <div
            className={`body max-h-[370px] ${
              initialPrizes.prizes.length > 10 ? `overflow-y-scroll` : ``
            } `}
          >
            {initialPrizes &&
              dataPrize.map((data, index) => {
                // let winnerArray;
                // if (data.winnerEmail) {
                //   winnerArray = data.winnerEmail[0];
                // }
                // console.log(winnerArray, "check");

                return (
                  <div
                    key={index}
                    className="rows w-full flex border-t-[1px] border-zinc-800 py-1.5 items-center"
                  >
                    <div
                      className={`px-1`}
                      style={{ width: `${columnSizePrize - 20}%` }}
                    >
                      <p>{data.name}</p>
                    </div>
                    <div
                      className="px-1 border-l-[1px] border-zinc-800 text-transparent"
                      style={{ width: `${columnSizePrize}%` }}
                    >
                      .
                      <div
                        className={`
                        relative overflow-x-clip mobilehover:hover:overflow-x-visible w-full cursor-pointer text-white`}
                        // defaultValue={data.winnerEmail ? data.winnerEmail : ""}
                        onClick={() => {
                          handleCopyEmailHidden(index, "prize");
                          handleCopyHighEmail(index);
                          // setButtonHighlight(true);
                          // setTimeout(() => {
                          //   setButtonHighlight(false);
                          // }, 2000);
                        }}
                      >
                        <p
                          className={`
                        
                        absolute top-0 left-0 translate-y-[-90%] w-max  px-2 py-1 rounded-md
                        ${
                          buttonHighlightEmail === index
                            ? "bg-green-500 mobilehover:hover:bg-green-400"
                            : "mobilehover:hover:bg-zinc-700"
                        }`}
                        >
                          {data.winnerEmail && data.winnerEmail.length > 0 ? (
                            <>
                              {data.winnerEmail[0]}
                              {data.winnerEmail.length > 1 ? (
                                <small>
                                  {" +"}
                                  {data.winnerEmail.length - 1}
                                  {" more"}
                                </small>
                              ) : (
                                ``
                              )}
                            </>
                          ) : (
                            "none"
                          )}
                        </p>
                      </div>
                      <button
                        className="hidden"
                        value={data.winnerEmail.join("\n")}
                        onClick={() => handleCopyEmail(index, "prize")}
                        ref={buttonRefs[index]}
                      ></button>
                    </div>
                    <div
                      className={`px-1 border-l-[1px] border-zinc-800`}
                      style={{ width: `${columnSizePrize - 20}%` }}
                    >
                      <p>{data.claimed ? `🟥` : `⬜`}</p>
                    </div>
                    <div
                      className={`px-1 border-l-[1px] border-zinc-800`}
                      style={{ width: `${columnSizePrize - 20}%` }}
                    >
                      <p>{data.count}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Codes;
