"use client";
import { useSocket } from "@/lib/providers/socket-provider";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  readDataClientCheckLock,
  validateAndAssignPrize,
} from "../(serverActions)/manageJSON";

type Props = {};

type FormValues = {
  // code: string;
  email: string;
  prize: string;
  rotate: number;
};

type FormState = {
  isLoading: boolean;
  values: FormValues;
  isSent: boolean;
};

const Lucky = (props: Props) => {
  const { socket } = useSocket();

  // Define form ---------------------------------------------------------------

  const ROTATION_START_POINT = -2;

  const initialFormState: FormState = {
    isLoading: false,
    isSent: false,
    values: {
      // code: "",
      email: "",
      prize: "",
      rotate: ROTATION_START_POINT, // -11.25
    },
  };

  const [formValues, setFormValues] = useState<FormState>(initialFormState);

  const { values } = formValues;

  const [invalidFormat, setInvalidFormat] = useState({
    // code: true,
    email: true,
  });

  const [invalidRequired, setInvalidRequired] = useState({
    // code: false,
    email: false,
  });

  const formChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [target.name]: target.value,
      },
    }));
  };

  const [confetti, setConfetti] = useState(false);

  const [rotateWheel, setRotateWheel] = useState(false);
  const wheelRotation = 360 * 5;

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormValues({
      ...formValues,
      isLoading: true,
      values: { ...values, prize: "", rotate: ROTATION_START_POINT },
    });
    setRotateWheel(false);
    setTimeout(() => {
      setRotateWheel(true);
    }, 500);
  };

  useEffect(() => {
    const onSubmit = async () => {
      // console.log("Pass");
      if (!rotateWheel) return;
      // console.log("Pass2");
      try {
        // toast.promise(validateAndAssignPrize(formValues.values.email,"common"), {
        //   error: (error) => {
        //     return `${error}`;
        //   },
        // },);
        const result = await validateAndAssignPrize(
          formValues.values.email,
          // formValues.values.code,
          "common"
        );

        // console.log(result, "CHEECK");
        // const rotationOption = result.rotate
        if (result.prizeName === "No more prizes left") {
          setFormValues({
            ...formValues,
            isLoading: false,
            isSent: true,
            values: {
              ...values,
              prize: result.prizeName,
              rotate: 112.5 + wheelRotation,
            },
          });

          // setFormValues({
          //   ...formValues,
          //   isSent: true,
          //   values: {
          //     ...values,
          //     rotate: 112.5 + wheelRotation,
          //   },
          // });
          // setTimeout(() => {
          //   setFormValues({
          //     ...formValues,
          //     values: {
          //       ...values,
          //       prize: result.prizeName,
          //     },
          //   });
          // }, 2000);

          setTimeout(() => {
            // setInvalidFormat({ ...invalidFormat });
            // setFormValues({
            //   ...formValues,
            //   values: {
            //     ...values,
            //     prize: result.prizeName,
            //   },
            // });
            setInvalidRequired({
              ...invalidRequired,
              // code: false,
              email: false,
            });
            setFormValues({
              ...formValues,
              isLoading: false,
              isSent: false,
              values: {
                ...values,
                // code: "",
                email: "",
                prize: result.prizeName,
                rotate: 112.5 + wheelRotation,
              },
            });
          }, 2000);

          throw new Error("No more prizes left");
        } else {
          setFormValues({
            ...formValues,
            isSent: true,
            values: {
              ...values,
              rotate: result.rotate + wheelRotation,
            },
          });

          // setTimeout(() => {
          //   setFormValues({
          //     ...formValues,
          //     values: {
          //       ...values,
          //       prize: result.prizeName,
          //     },
          //   });
          // }, 2000);

          setTimeout(() => {
            setFormValues({
              ...formValues,
              values: {
                ...values,
                prize: result.prizeName,
              },
            });
            // setInvalidFormat({ ...invalidFormat });
            setInvalidRequired({
              ...invalidRequired,
              // code: false,
              email: false,
            });
            setFormValues({
              ...formValues,
              isLoading: false,
              isSent: false,
              values: {
                ...values,
                // code: "",
                email: "",
                prize: result.prizeName,
                rotate: result.rotate + wheelRotation,
              },
            });
            setConfetti(true);
          }, 2000);

          // setTimeout(() => {
          // }, 2000);

          setTimeout(() => {
            setConfetti(false);
          }, 4000);

          // await emailSend(formValues.values.code);
          socket.emit("refetch-data", { copied: true });
          // console.log("Pass");

          // console.log(res);
        }

        // console.log("Success!");
      } catch (error) {
        // console.log(error, "CHECK");
        toast.error(`Email already used for a prize.`);

        // setInvalidFormat({ ...invalidFormat });
        setFormValues({
          ...formValues,
          isLoading: false,
          isSent: false,
        });
      }
    };
    onSubmit();
    // toast.promise(onSubmit, {
    //   loading: "Loading..",
    //   error: (error) => {
    //     return `${error}`;
    //   },
    // });
  }, [rotateWheel]);

  // console.log(values.rotate);

  // console.log(rotateValue);

  const [wheelOption, setWheelOption] = useState(false);

  useEffect(() => {
    if (socket === null) return;

    const fetchData = () => {
      readDataClientCheckLock().then(({ result }) => {
        setWheelOption(result);
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

  return (
    <div
      className="max-w-none sm:max-w-[1060px] mx-auto w-full py-16"
      id="idt_lucky"
    >
      <div className="w-full sm:w-4/5 mx-auto px-4 sm:px-0 flex items-center flex-col-reverse sm:flex-row">
        {confetti && (
          <img
            src="https://idealtech.com.my/wp-content/uploads/2024/08/confetti-transparent.gif"
            alt="confetti"
            className={cn(`absolute z-50 left-0 w-full pointer-events-none`)}
          />
        )}

        <div className="relative p-4">
          {/* <p>{values.prize}</p> */}

          <div className="relative w-[90%] mx-auto mt-4 sm:mt-0">
            <div
              className="bg-yellow-400 w-[30px] h-[30px] z-[1] absolute top-0 translate-y-[-50%] right-[50%] translate-x-[50%]"
              style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
            ></div>
            <img
              src="https://idealtech.com.my/wp-content/uploads/2024/08/luckydraw-top.png"
              alt="wheel-top"
              className="absolute z-10 select-none"
            />
            <img
              src={
                wheelOption
                  ? "https://idealtech.com.my/wp-content/uploads/2024/08/luckydraw-non-yushiro.webp"
                  : "https://idealtech.com.my/wp-content/uploads/2024/08/luckydraw-yushiro-v3.webp"
              }
              alt="wheel"
              className={`${
                rotateWheel ? `transition-all ease-out duration-[2000ms]` : ``
              } w-full select-none`}
              style={{ transform: `rotate(${values.rotate}deg)` }} //${values.rotate}
            />
          </div>
        </div>
        <form className="w-full max-w-[400px] justify-center sm:justify-start">
          <h2
            className={`${
              values.prize != ""
                ? `${
                    values.prize === "No more prizes left" ? `hidden` : `block`
                  }`
                : `hidden`
            } mb-8 text-center sm:text-start`}
          >
            Congratz! <br /> You won{" "}
            <b className="text-accent">{values.prize}</b>
          </h2>
          <h2
            className={`${
              values.prize != ""
                ? `${
                    values.prize === "No more prizes left" ? `block` : `hidden`
                  }`
                : `hidden`
            } mb-8 text-center sm:text-start`}
          >
            Don&apos;t be sad! <br /> Try again next time.
          </h2>
          <h2
            className={`${
              values.prize != "" ? `hidden` : `block`
            } mb-8 text-center sm:text-start`}
          >
            Ready to spin? <br /> Good Luck!
          </h2>
          <div className="w-full">
            <label htmlFor="email__label">
              <p>
                Your Email <b style={{ color: "red" }}>*</b>
              </p>
            </label>
            <p>
              <input
                type="email"
                className={`text-black bg-secondary py-2 px-4 w-full max-w-[500px] rounded-lg mt-2 mb-2 border-[3px]
                ${
                  invalidFormat.email ? "border-transparent" : "border-red-500"
                }`}
                required
                name="email"
                value={values.email}
                onChange={formChange}
                onInput={(e) => {
                  const input = e.currentTarget as HTMLInputElement;
                  setInvalidFormat({
                    ...invalidFormat,
                    email: input.validity.valid,
                  });
                  setInvalidRequired({
                    ...invalidRequired,
                    email: input.validity.valueMissing,
                  });
                }}
              />
              <span
                className={`${
                  invalidRequired.email
                    ? "hidden"
                    : invalidFormat.email
                    ? "hidden"
                    : "block"
                } mb-2`}
                style={{ fontSize: 12, color: "red" }}
              >
                Invalid Email
              </span>
              <span
                className={`${invalidRequired.email ? "block" : "hidden"} mb-2`}
                style={{ fontSize: 12, color: "red" }}
              >
                Required
              </span>
            </p>
          </div>
          {/* <label htmlFor="code__label">
            <p>
              Validation Code <b style={{ color: "red" }}>*</b>
            </p>
          </label>
          <p>
            <input
              type="text"
              className={`text-black bg-secondary py-2 px-4 w-full max-w-[500px] rounded-lg mt-2 mb-2 border-[3px]
            ${invalidRequired.code ? "border-red-500" : "border-transparent"}`}
              required
              name="code"
              value={values.code}
              onChange={formChange}
              onInput={(e) => {
                const input = e.currentTarget as HTMLInputElement;
                setInvalidRequired({
                  ...invalidRequired,
                  code: input.validity.valueMissing,
                });
              }}
            />
            <span
              className={`${
                invalidRequired.code
                  ? "hidden"
                  : invalidFormat.code
                  ? "hidden"
                  : "block"
              } mb-2`}
              style={{ fontSize: 12, color: "red" }}
            >
              Invalid Code
            </span>
            <span
              className={`${invalidRequired.code ? "block" : "hidden"} mb-2`}
              style={{ fontSize: 12, color: "red" }}
            >
              Required
            </span>
          </p> */}
          <div className="w-full flex py-4 justify-center sm:justify-start">
            <button
              className={` z-[1]
              py-2 px-4  text-secondary font-bold rounded-xl border-transparent
                         transition-all
                        ${formValues.isLoading ? "bg-green-600" : ""}
                        ${
                          // !values.code ||
                          !values.email ||
                          // invalidRequired.code ||
                          invalidRequired.email ||
                          !invalidFormat.email
                            ? "mobilehover:hover:bg-zinc-500/50 bg-zinc-500"
                            : "mobilehover:hover:bg-accent/50 bg-accent"
                        }`}
              disabled={
                // !values.code ||
                !values.email ||
                // invalidRequired.code ||
                invalidRequired.email ||
                !invalidFormat.email
              }
              onClick={handleSubmit}
            >
              <p>
                {formValues.isLoading
                  ? "Submitting.."
                  : formValues.isSent
                  ? "Submitted!"
                  : "Submit"}
              </p>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Lucky;
