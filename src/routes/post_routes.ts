import express, { Router } from "express";
import {authMiddleware} from "../controllers/auth_controller"
import {
    createPost,
    getPosts,
    getPostById,
    getPostsBySender,
    updatePost,
    deletePost,
} from "../controllers/post";

const router: Router = express.Router();

// Specific routes should come first
router.get("/by-sender", getPostsBySender); // Get posts by sender
router.get("/:id", getPostById);            // Get a post by ID
router.post("/", authMiddleware, (req, res, next) => {
    console.log("Request Body for Create Post:", req.body); // Debug request body
    next();
}, createPost);

router.get("/", getPosts);                  // Get all posts
router.put("/:id", authMiddleware, updatePost);             // Update a post by ID
router.delete("/:id", authMiddleware, deletePost);          // Delete a post by ID

export default router;
