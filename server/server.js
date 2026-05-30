import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import postRouter from "./src/routes/postRoutes.js";
import searchRouter from "./src/routes/searchRoutes.js";
dotenv.config({ path: "./.env" });

if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in server/.env — add it and restart the server.");
    process.exit(1);
}

const app = express();


app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true
}))

app.use(express.json())



app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/posts", postRouter)
app.use("/api/search", searchRouter)


const PORT = process.env.PORT;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend server is running on port ${PORT}`);
    });
});
