import express, { Express } from "express";
import mongoose from "mongoose";
import { errors } from "celebrate";
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import cardRouter from "./routes/cardRoutes";
import { auth } from "./middlewares/auth";
import { requestLogger, errorLogger } from "./middlewares/logger";
import errorHandler from "./middlewares/errorHandler";
import HTTP_STATUS from "./utils/statusCodes";

const app: Express = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/crash-test", (req, res) => {
  setTimeout(() => {
    throw new Error("Сервер сейчас упадёт");
  }, 0);
});

app.use(requestLogger);

app.use("/", authRouter);
app.use("/cards", cardRouter);
app.use("/users", userRouter);

app.use((req, res) => {
  res
    .status(HTTP_STATUS.NOT_FOUND)
    .send({ message: "Запрашиваемый ресурс не найден" });
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

async function start() {
  await mongoose.connect("mongodb://localhost:27017/mestodb");
  console.log("Connected to MongoDB database: mestodb");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("MongoDB connection error:", err);
});
