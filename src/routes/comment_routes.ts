import express, { Router } from "express";
import {authMiddleware} from "../controllers/auth_controller"
import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
    getComments,
} from "../controllers/comment";

const router: Router = express.Router();

// Define routes
router.post("/",authMiddleware, createComment); // Create a comment
router.get("/post/:postId", getCommentsByPost); // Get comments by post ID
router.get("/", getComments); // Get all comments
router.put("/:id",authMiddleware, updateComment); // Update a comment by ID
router.delete("/:id",authMiddleware, deleteComment); // Delete a comment by ID

export default router;
