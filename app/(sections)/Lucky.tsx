"use client";
import React, { useEffect, useState } from "react";
import {
  emailSend,
  readData,
  validateAndAssignPrize,
  writeData,
} from "../(serverActions)/manageJSON";

type Props = {};

const Lucky = (props: Props) => {
  type FormValues = {
    code: string;
    email: string;
    prize: string;
    rotate: number;
  };

  type FormState = {
    isLoading: boolean;
    values: FormValues;
    isSent: boolean;
  };

  const initialFormState: FormState = {
    isLoading: false,
    isSent: false,
    values: {
      code: "",
      email: "",
      prize: "",
      rotate: -11.25,
    },
  };

  const [formValues, setFormValues] = useState<FormState>(initialFormState);

  const { values } = formValues;

  const [invalidFormat, setInvalidFormat] = useState({
    code: true,
    email: true,
  });

  const [invalidRequired, setInvalidRequired] = useState({
    code: false,
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

  const [rotateWheel, setRotateWheel] = useState(false);
  const wheelRotation = 360 * 5 + -11.25;

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFormValues({
      ...formValues,
      isLoading: true,
      values: { ...values, prize: "", rotate: -11.25 },
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
        const result = await validateAndAssignPrize(
          formValues.values.email,
          formValues.values.code,
          "common"
        );
        if (result.prizeName === "No more prizes left") {
          setFormValues({
            ...formValues,
            isLoading: false,
            values: {
              ...values,
              prize: result.prizeName,
            },
          });

          setFormValues({
            ...formValues,
            isSent: true,
            values: {
              ...values,
              rotate: 112.5 + wheelRotation,
            },
          });
          setTimeout(() => {
            setFormValues({
              ...formValues,
              values: {
                ...values,
                prize: result.prizeName,
              },
            });
          }, 2000);

          setTimeout(() => {
            setInvalidFormat({ ...invalidFormat, code: true });
            setInvalidRequired({
              ...invalidRequired,
              code: false,
              email: false,
            });
            setFormValues({
              ...formValues,
              isLoading: false,
              isSent: false,
              values: {
                ...values,
                code: "",
                email: "",
                prize: result.prizeName,
                rotate: 112.5 + wheelRotation,
              },
            });
          }, 2000);

          // throw new Error("No more prizes left");
        } else {
          setFormValues({
            ...formValues,
            isSent: true,
            values: {
              ...values,
              rotate: result.rotate + wheelRotation,
            },
          });
          setTimeout(() => {
            setFormValues({
              ...formValues,
              values: {
                ...values,
                prize: result.prizeName,
              },
            });
          }, 2000);

          setTimeout(() => {
            setInvalidFormat({ ...invalidFormat, code: true });
            setInvalidRequired({
              ...invalidRequired,
              code: false,
              email: false,
            });
            setFormValues({
              ...formValues,
              isLoading: false,
              isSent: false,
              values: {
                ...values,
                code: "",
                email: "",
                prize: result.prizeName,
                rotate: result.rotate + wheelRotation,
              },
            });
          }, 2000);

          await emailSend(formValues.values.code);

          // console.log(res);

          // await fetch("/api/contact", {
          //   method: "POST",
          //   body: JSON.stringify({
          //     ...formValues,
          //     values: { ...values, prize: result.prizeName },
          //   }),
          //   headers: {
          //     "Content-Type": "application/json",
          //     Accept: "application/json",
          //   },
          // });
        }

        // console.log("Success!");
      } catch (error) {
        console.log(error);

        setInvalidFormat({ ...invalidFormat, code: false });
        setFormValues({
          ...formValues,
          isLoading: false,
          isSent: false,
        });
      }
    };
    onSubmit();
  }, [rotateWheel]);

  // console.log(rotateValue);

  return (
    <div
      className="max-w-none sm:max-w-[1060px] mx-auto w-full py-16"
      id="idt_lucky"
    >
      <div className="w-full sm:w-4/5 mx-auto px-4 sm:px-0 flex items-center flex-col-reverse sm:flex-row">
        <div className="relative p-4">
          {/* <p>{values.prize}</p> */}

          <div className="relative w-[90%] mx-auto mt-4 sm:mt-0">
            <div
              className="bg-white w-[30px] h-[30px] z-[1] absolute right-0 translate-y-[-50%] top-[50%] translate-x-[50%]"
              style={{ clipPath: "polygon(100% 100%, 100% 0, 0 50%)" }}
            ></div>
            <img
              src="https://idealtech.com.my/wp-content/uploads/2023/11/01-wheel-ori.png"
              alt="wheel"
              className={`${
                rotateWheel ? `transition-all ease-out duration-[2000ms]` : ``
              } w-full`}
              style={{ transform: `rotate(${values.rotate}deg)` }}
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
          <label htmlFor="code__label">
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
          </p>
          <div className="w-full flex py-4 justify-center sm:justify-start">
            <button
              className={` z-[1]
              py-2 px-4  text-secondary font-bold rounded-xl border-transparent
                         transition-all
                        ${formValues.isLoading ? "bg-green-600" : ""}
                        ${
                          !values.code ||
                          !values.email ||
                          invalidRequired.code ||
                          invalidRequired.email ||
                          !invalidFormat.email
                            ? "mobilehover:hover:bg-zinc-500/50 bg-zinc-500"
                            : "mobilehover:hover:bg-accent/50 bg-accent"
                        }`}
              disabled={
                !values.code ||
                !values.email ||
                invalidRequired.code ||
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
