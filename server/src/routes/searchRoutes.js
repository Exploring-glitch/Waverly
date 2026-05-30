import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { search } from "../controllers/searchController.js";

const searchRouter = express.Router();

searchRouter.get("/", protect, search);

export default searchRouter;
