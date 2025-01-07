import express, { Router } from "express";
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
router.post("/", createPost);               // Add a new post
router.get("/", getPosts);                  // Get all posts
router.put("/:id", updatePost);             // Update a post by ID
router.delete("/:id", deletePost);          // Delete a post by ID

export default router;
