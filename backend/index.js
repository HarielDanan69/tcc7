import express from "express";
import cors from "cors";
import UserRoute from "./routes/UserRoute.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

const app = express();
app.set("view engine", "ejs");

dotenv.config();
app.use(cors({ credentials: true, origin: "https://fe-069-dot-f-04-460503.uc.r.appspot.com" }));
app.use(cookieParser());

app.use(express.json());
app.get("/", (req, res) => res.render("index"));
app.use(UserRoute);

app.listen(5000, () => console.log("Server up and running..."));
