import { Request, Response } from "express";
import Post from "../models/post"; // Assuming Post is exported as a default TypeScript module

// Create a post
export const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.query.userId as string;

        // Validate userId and required fields
        if (!userId) {
            res.status(400).send({ error: "User ID is required" });
            return;
        }

        const { title, content } = req.body;

        if (!title || !content) {
            res.status(400).send({ error: "Title and content are required" });
            return;
        }

        // Create a new post
        const post = new Post({
            title,
            content,
            sender: userId, // Associate post with the sender
        });

        await post.save();
        res.status(201).send(post); // Respond with the created post
    } catch (err) {
        console.error("Error creating post:", err); // Log error for debugging
        res.status(500).send({ error: "Failed to create post", details: err });
    }
};

// Get all posts
export const getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find();
        res.status(200).send(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send({ error: "Failed to fetch posts", details: err });
    }
};

// Get a single post by ID
export const getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }
        res.status(200).send(post);
    } catch (err) {
        console.error("Error fetching post by ID:", err);
        res.status(500).send({ error: "Failed to fetch post by ID", details: err });
    }
};

// Update a post
export const updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }
        res.status(200).send(post);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(400).send({ error: "Failed to update post", details: err });
    }
};

// Delete a post
export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }
        res.status(200).send(post);
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).send({ error: "Failed to delete post", details: err });
    }
};

// Get posts by sender ID
export const getPostsBySender = async (req: Request, res: Response): Promise<void> => {
    try {
        const senderId = req.query.sender as string; // Get sender ID from query parameters
        if (!senderId) {
            res.status(400).send({ error: "Sender ID is required" });
            return;
        }

        const posts = await Post.find({ sender: senderId });
        res.status(200).send(posts);
    } catch (err) {
        console.error("Error fetching posts by sender:", err);
        res.status(500).send({ error: "Failed to fetch posts by sender", details: err });
    }
};
