"use server";
import fs from "fs/promises";
import path from "path";

// Helper function to read data from the specific JSON file
async function readData(fileName: string) {
  const filePath = getFilePath(fileName); // Use the previously defined getFilePath function
  try {
    const rawData = await fs.readFile(filePath, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    // Handle the error, such as if the file does not exist
    throw error;
  }
}

async function readDataCodes(fileName: string) {
  const filePath = getFilePathCodes(fileName); // Use the previously defined getFilePath function
  try {
    const rawData = await fs.readFile(filePath, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    // Handle the error, such as if the file does not exist
    throw error;
  }
}

async function readDataClient(fileName: string) {
  const filePath = getFilePath(fileName); // Use the previously defined getFilePath function
  try {
    const rawData = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(rawData) as PrizeData;

    const countAvailable = data.prizes
      .filter((item) => !item.claimed)
      .reduce((acc, current) => acc + current.count, 0);
    const countsClaimed = data.prizes.flatMap(
      (prize) => prize.winnerEmail
    ).length;
    // console.log(countsClaimed, "CLAIMED");
    return { countAvailable, countsClaimed };
  } catch (error) {
    // Handle the error, such as if the file does not exist
    throw error;
  }
}

export async function readDataClientCheckLock() {
  const filePath = getFilePath("common");
  try {
    const rawData = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(rawData) as PrizeData;

    const checkAvailable = data.prizes.filter(
      (item) => item.claimed && item.id === 12
    );

    const result = checkAvailable.length > 0;
    return { result };
  } catch (error) {
    throw new Error(`${error}`);
  }
}

async function readAllDataCodes() {
  const directoryPath = path.join(process.cwd(), "data/codes"); // Use the previously defined getFilePath function
  try {
    const files = await fs.readdir(directoryPath);

    // Filter JSON files
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    // Read and parse each JSON file
    const allCodes = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(directoryPath, file);
        const rawData = await fs.readFile(filePath, "utf8");
        return JSON.parse(rawData);
      })
    );

    return allCodes;

    // return JSON.parse(rawData);
  } catch (error) {
    // Handle the error, such as if the file does not exist
    throw error;
  }
}

// Helper function to generate the file path for the given id
function getFilePath(fileName: string) {
  return path.join(process.cwd(), "data", `${fileName}.json`);
}
function getFilePathCodes(code: string) {
  return path.join(process.cwd(), "data/codes", `${code}.json`);
}

// Updated writeData function to write to a specific file based on the id
async function writeData(data: any, fileName: string) {
  const filePath = getFilePath(fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data));
  } catch (error) {
    throw new Error(`${error}`);
  }
}
async function writeDataCodes(data: any, code: string) {
  const filePath = getFilePathCodes(code);
  await fs.writeFile(filePath, JSON.stringify(data));
}

type DataFormat = {
  code: string;
  email: string | null;
  used: boolean;
  copied: boolean;
};

export type PrizeFormat = {
  id: number;
  name: string;
  claimed: boolean;
  winnerEmail: string[];
  rotate: number;
  rotateAlt: number;
  count: number;
  percentile: number;
  percentileAlt: number;
};

export type PrizeData = {
  prizes: PrizeFormat[];
  dataSaves: {
    selectedPrizeLock: boolean;
    selectedPrizeFullClaimed: boolean;
    pityPullCounter: number;
    pityHitCount: number;
  };
};

// New server action for code validation and prize assignment
async function validateAndAssignPrize(
  email: string,
  // code: string,
  fileName: string
) {
  const data = (await readData(fileName)) as PrizeData;
  // const codeEntry = await readDataCodes(code);

  try {
    const emailApplied = data.prizes.flatMap((prize) => prize.winnerEmail);

    const selectedPrizeLock = data.dataSaves.selectedPrizeLock;

    const PITY_PULL_SET = selectedPrizeLock ? 85 : 100;

    // console.log(emailApplied);

    if (emailApplied.includes(email)) {
      throw new Error("Email already used for a prize."); // OPEN THIS WHEN DONE DEVELOP -------------------------------------------
    }

    // const loopTest = async (
    //   data: PrizeData,
    //   fileName: string,
    //   email: string,
    //   selectedPrizeLock: boolean
    // ): Promise<{ prizeName: string; rotate: number }> => {
    //   return new Promise<{ prizeName: string; rotate: number }>(
    //     (resolve, reject) => {
    //       let i = 1;

    //       const timer = () =>
    //         setTimeout(async () => {
    //           const availablePrizes = data.prizes
    //             .sort((a, b) =>
    //               selectedPrizeLock
    //                 ? a.percentile - b.percentile
    //                 : a.percentileAlt - b.percentileAlt
    //             )
    //             .filter((prize) => !prize.claimed && prize.count > 0)
    //             .filter((pity) =>
    //               data.dataSaves.pityPullCounter === PITY_PULL_SET
    //                 ? pity.id <= 5
    //                 : pity
    //             );

    //           if (availablePrizes.length === 0) {
    //             resolve({ prizeName: "No more prizes available", rotate: 0 });
    //             return;
    //           }

    //           const weightedIndex = weightedRandomIndex(
    //             availablePrizes,
    //             selectedPrizeLock
    //           ); // Ensure this function is defined and returns a number.
    //           const selectedPrize = availablePrizes[weightedIndex];

    //           selectedPrize.count -= 1;
    //           if (selectedPrize.count === 0) {
    //             selectedPrize.claimed = true;
    //           }
    //           selectedPrize.winnerEmail.push(email);

    //           if (
    //             selectedPrize.id === 1 ||
    //             selectedPrize.id === 2 ||
    //             selectedPrize.id === 3 ||
    //             selectedPrize.id === 4 ||
    //             selectedPrize.id === 5
    //           ) {
    //             if (data.dataSaves.pityPullCounter === PITY_PULL_SET) {
    //               data.dataSaves.pityHitCount++;
    //             }
    //             data.dataSaves.pityPullCounter = 0;
    //           } else {
    //             data.dataSaves.pityPullCounter++;
    //           }

    //           if (selectedPrize.id === 12 && selectedPrize.claimed === true) {
    //             data.dataSaves.selectedPrizeFullClaimed = true;
    //             data.dataSaves.selectedPrizeLock = true;
    //           }

    //           await writeData(data, fileName); // Ensure this function is async and returns a Promise.

    //           const checkAvailable = data.prizes.filter(
    //             (item) => item.claimed && item.id === 12
    //           );
    //           const selectedAvailable = checkAvailable.length > 0;

    //           i++;
    //           if (i <= 60) {
    //             timer(); // Recursively set the next timer if the loop is not yet finished.
    //           } else {
    //             resolve({
    //               prizeName: selectedPrize.name,
    //               rotate: selectedAvailable
    //                 ? selectedPrize.rotate
    //                 : selectedPrize.rotateAlt,
    //             });
    //           }
    //         }, 50);
    //       timer(); // Start the timer loop.
    //     }
    //   );
    // };

    // const result = await loopTest(data, fileName, email, selectedPrizeLock);

    // return result;

    // REAL SET -------------------------------------------------------------------------------------------
    const availablePrizes = data.prizes
      .sort((a, b) =>
        selectedPrizeLock
          ? a.percentile - b.percentile
          : a.percentileAlt - b.percentileAlt
      )
      .filter((prize) => !prize.claimed && prize.count > 0)
      .filter((pity) =>
        data.dataSaves.pityPullCounter >= PITY_PULL_SET ? pity.id <= 5 : pity
      );

    if (availablePrizes.length === 0) {
      return { prizeName: "No more prizes available", rotate: 0 };
    }

    const weightedIndex = weightedRandomIndex(
      availablePrizes,
      selectedPrizeLock
    ); // Ensure this function is defined and returns a number.
    const selectedPrize = availablePrizes[weightedIndex];

    selectedPrize.count -= 1;
    if (selectedPrize.count === 0) {
      selectedPrize.claimed = true;
    }
    selectedPrize.winnerEmail.push(email);

    if (
      selectedPrize.id === 1 ||
      selectedPrize.id === 2 ||
      selectedPrize.id === 3 ||
      selectedPrize.id === 4 ||
      selectedPrize.id === 5
    ) {
      if (data.dataSaves.pityPullCounter >= PITY_PULL_SET) {
        data.dataSaves.pityHitCount++;
      }
      data.dataSaves.pityPullCounter = 0;
    } else {
      data.dataSaves.pityPullCounter++;
    }

    if (selectedPrize.id === 12 && selectedPrize.claimed === true) {
      data.dataSaves.selectedPrizeFullClaimed = true;
      data.dataSaves.selectedPrizeLock = true;
    }

    const checkAvailable = data.prizes.filter(
      (item) => item.claimed && item.id === 12
    );
    const selectedAvailable = checkAvailable.length > 0;

    if (selectedAvailable) {
      data.dataSaves.selectedPrizeLock = true;
    }

    await writeData(data, fileName); // Ensure this function is async and returns a Promise.

    return {
      prizeName: selectedPrize.name,
      rotate: selectedAvailable
        ? selectedPrize.rotate
        : selectedPrize.rotateAlt,
    };
  } catch (error) {
    const e = error as Error;
    throw new Error(`${e.message}`);
  }
}

function weightedRandomIndex(
  prizes: PrizeFormat[],
  prizeLock: boolean
): number {
  const totalWeight = prizes.reduce(
    (acc, prize) =>
      prizeLock ? acc + prize.percentile : acc + prize.percentileAlt,
    0
  );

  let random = Math.random() * totalWeight;
  // console.log(random, "CHECK");
  for (let i = 0; i < prizes.length; i++) {
    if (random < (prizeLock ? prizes[i].percentile : prizes[i].percentileAlt)) {
      // console.log(i, random, prizes[i].percentile, "CHEK");
      return i;
    }
    random -= prizeLock ? prizes[i].percentile : prizes[i].percentileAlt;
  }

  return prizes.length - 1;
}

export async function triggerSelectedPrize() {
  const data = (await readData("common")) as PrizeData;
  const finalData = data.prizes.map((prize) => {
    if (prize.id === 12 || prize.id === 13 || prize.id === 14) {
      if (prize.claimed === false) {
        return {
          ...prize,
          claimed: true,
        };
      } else {
        if (prize.count > 0) {
          return {
            ...prize,
            claimed: false,
          };
        } else {
          return { ...prize };
        }
      }
    } else {
      return { ...prize };
    }
  });

  await writeData(
    {
      prizes: finalData,
      dataSaves: {
        selectedPrizeLock: data.dataSaves.selectedPrizeFullClaimed
          ? data.dataSaves.selectedPrizeLock
          : !data.dataSaves.selectedPrizeLock,
        selectedPrizeFullClaimed: data.dataSaves.selectedPrizeFullClaimed,
        pityPullCounter: data.dataSaves.pityPullCounter,
        pityHitCount: data.dataSaves.pityHitCount,
      },
    },
    "common"
  );
}

async function emailSend(code: string) {
  const codeEntry = await readDataCodes(code);

  if (!codeEntry.prize || !codeEntry.email) {
    throw new Error("prize or email not in db.");
  }

  const hostname =
    process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : process.env.HOSTNAME;

  const res = await fetch(`${hostname}/api/contact`, {
    method: "POST",
    body: JSON.stringify({
      values: {
        prize: codeEntry.prize,
        email: codeEntry.email,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const errorText = await res.text();

    // return response;
    throw new Error(
      `Failed to fetch email.text:${errorText}, status:${res.status}`
    );
  }
}

async function copiedCodeAdmin(code: string, copy: boolean, fileName: string) {
  const codeMatch = await readDataCodes(code);

  // const codeMatch = data.codes.find((entry: DataFormat) => entry.code === code);
  if (!codeMatch) {
    throw new Error("Invalid code");
  }

  if (copy) {
    codeMatch.copied = true;
  } else {
    codeMatch.copied = false;
  }

  await writeDataCodes(codeMatch, code);
  return codeMatch;
}

let queue: WriteJob[] = []; // Our write queue
let isProcessing = false; // Flag to check if a job is currently being processed

type WriteJob = {
  fileName: string;
  data: any;
  resolve: () => void;
  reject: (reason?: any) => void;
};

async function processQueue() {
  if (queue.length === 0 || isProcessing) {
    return; // If there's no job or a job is currently being processed, we exit
  }

  const job = queue.shift(); // Get the next job from the queue

  if (!job) {
    return; // Exit if no job was retrieved (just a safety check)
  }

  isProcessing = true;

  try {
    await writeData(job.data, job.fileName); // Write data to the file
    job.resolve(); // If successful, resolve the promise
  } catch (error) {
    job.reject(error); // If there's an error, reject the promise
  } finally {
    isProcessing = false; // Mark the job as done
    processQueue(); // Check if there are more jobs in the queue
  }
}

function queueWrite(data: any, fileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    queue.push({ fileName, data, resolve, reject }); // Push a new job into the queue
    processQueue(); // Start processing the queue
  });
}

// Helper function to get all quote file paths
async function getAllQuoteFilePaths(): Promise<string[]> {
  const dirPath = path.join(process.cwd(), "data");
  const files = await fs.readdir(dirPath);
  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(dirPath, file));
}

// Function to delete the oldest files
async function deleteOldestFiles(maxFiles: number): Promise<void> {
  try {
    const filePaths = await getAllQuoteFilePaths();
    if (filePaths.length > maxFiles) {
      // Get file creation times
      const fileCreationTimes = await Promise.all(
        filePaths.map(async (filePath) => {
          const stats = await fs.stat(filePath);
          return { filePath, ctime: stats.ctime.getTime() }; // Convert ctime to a numeric timestamp
        })
      );

      // Sort by creation time, oldest first
      fileCreationTimes.sort((a, b) => a.ctime - b.ctime);

      // Delete the oldest files
      for (let i = 0; i < fileCreationTimes.length - maxFiles; i++) {
        await fs.unlink(fileCreationTimes[i].filePath);
      }
    }
  } catch (error) {
    console.error("Error deleting oldest files:", error);
    // Handle errors as needed
  }
}

type userEmail = {
  email: string;
  role: string;
};

async function findUserByEmail(
  email: string | null | undefined,
  fileName: string
) {
  const data = await readData(fileName);

  const users = data.find((user: userEmail) => user.email === email);

  if (users && users.email) {
    users.email = undefined;
  }
  // console.log(users, "check data passed");
  return users;
}

export {
  copiedCodeAdmin,
  deleteOldestFiles,
  emailSend,
  findUserByEmail,
  queueWrite,
  readAllDataCodes,
  readData,
  readDataClient,
  validateAndAssignPrize,
  writeData
};

