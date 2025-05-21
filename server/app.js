import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import entryRouter from "./routes/entryRouter.js";
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";

export const app = express();
config({ path: "./config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/entries", entryRouter);

removeUnverifiedAccounts();
connection();

app.use(errorMiddleware);