import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errors } from "celebrate";
import errorHandler from "./middlewares/error-handler";
import { DB_ADDRESS } from "./config";
import routes from "./routes";

const { PORT = 3000 } = process.env;
const app = express();
mongoose.connect(DB_ADDRESS);

app.use(
  cors({
    origin: "https://eioven-mesto.nomorepartiessite.ru",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Сервер сейчас упадёт");
  }, 0);
});

app.use(routes);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => console.log("ok"));
