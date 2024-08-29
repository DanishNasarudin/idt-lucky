import { NextAPIResponseServerIo } from "@/lib/types";
import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

type RowLocks = {
  [rowId: string]: number;
};

type UserLocks = {
  [socketId: string]: Set<string>;
};

const ioHandler = (req: NextApiRequest, res: NextAPIResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    });

    const rowLocks: RowLocks = {};
    const userLocks: UserLocks = {};

    io.on("connection", (socket) => {
      console.log(`user connected`);
      socket.on("button-copy", (change) => {
        socket.broadcast.emit("button-copy", change);
        // console.log(change);
      });
      socket.on("button-reset", (newE) => {
        socket.broadcast.emit("button-reset", newE);
        // console.log(newE);
      });
      socket.on("refetch-data", (newE) => {
        io.emit("refetch-data", newE);
        // console.log(newE);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
