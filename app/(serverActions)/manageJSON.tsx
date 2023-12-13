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
    const data = JSON.parse(rawData);

    const counts = data.prizes.map((prize: PrizeFormat) => ({
      count: prize.count,
    }));
    // console.log(counts);
    return counts;
  } catch (error) {
    // Handle the error, such as if the file does not exist
    throw error;
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
  await fs.writeFile(filePath, JSON.stringify(data));
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

type PrizeFormat = {
  id: number;
  name: string;
  claimed: boolean;
  winnerEmail: string | null;
  rotate: number;
  count: number;
};

// New server action for code validation and prize assignment
async function validateAndAssignPrize(
  email: string,
  code: string,
  fileName: string
) {
  const data = await readData(fileName);
  const codeEntry = await readDataCodes(code);

  // const codeEntry = dataCodes

  // Find the code entry
  // const codeEntry = data.codes.find((entry: DataFormat) => entry.code === code);
  if (!codeEntry || codeEntry.used) {
    throw new Error("Invalid or used code");
  }

  // Mark the code as used and associate the email
  codeEntry.used = true;
  codeEntry.email = email;

  const chances = [5, 10, 20, 40, 80]; // Array representing the percentage chances

  const weights = data.prizes.map((prize: PrizeFormat, index: number) => {
    return chances[index];
  });

  // console.log(weights, "weights array");

  // Prize randomizer logic
  const unclaimedPrizes = data.prizes.filter(
    (prize: PrizeFormat) => !prize.claimed
  );

  function weightedRandomIndex(weights: number[]): number {
    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
    // console.log(totalWeight, "total weight");
    let random = Math.random() * totalWeight;
    // console.log(random, "random");
    // console.log(weights.length, "weight length");

    for (let i = 0; i < weights.length; i++) {
      // console.log(random, "random in for");
      // console.log(weights[i], "weights in for");
      if (random < weights[i]) return i;
      random -= weights[i];
    }
    // console.log(weights.length, "weight length after for");
    return weights.length - 1;
  }

  if (unclaimedPrizes.length > 0) {
    const weightedIndex = weightedRandomIndex(weights);
    // console.log(weightedIndex, "index chose");
    const selectedPrize = unclaimedPrizes[weightedIndex];

    // Mark the prize as claimed
    selectedPrize.count = selectedPrize.count - 1;
    if (selectedPrize.count === 0) {
      selectedPrize.claimed = true;
    }
    selectedPrize.winnerEmail.push(email);

    codeEntry.prize = selectedPrize.name;

    // Save the updated data t
    await writeData(data, fileName);
    await writeDataCodes(codeEntry, code);

    return { prizeName: selectedPrize.name, rotate: selectedPrize.rotate };
  } else {
    return { prizeName: "No more prizes left" };
  }
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
  readData,
  writeData,
  queueWrite,
  deleteOldestFiles,
  validateAndAssignPrize,
  findUserByEmail,
  copiedCodeAdmin,
  readAllDataCodes,
  emailSend,
  readDataClient,
};
