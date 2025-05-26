import express from "express";
import cors from "cors";
import UserRoute from "./routes/UserRoute.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

const app = express();
app.set("view engine", "ejs");

dotenv.config();
app.use(cors({ credentials: true, origin: "http://127.0.0.1:5500" }));
app.use(cookieParser());

app.use(express.json());
app.get("/", (req, res) => res.render("index"));
app.use(UserRoute);

app.listen(5000, () => console.log("Server up and running..."));
