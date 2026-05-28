import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
dotenv.config({ path: "./.env" });
const app = express();


app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))



const PORT = process.env.PORT;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend server is running on port ${PORT}`);
    });
});
