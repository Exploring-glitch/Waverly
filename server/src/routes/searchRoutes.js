import express from "express";
import { search } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const searchRouter = express.Router();

searchRouter.get("/", protect, search);

export default searchRouter;
