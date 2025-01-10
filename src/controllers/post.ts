import { Request, Response } from "express";
import Post from "../models/post"; // Assuming Post is exported as a default TypeScript module

// Define createPost function
export const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const _id = req.query.userId
        const post = new Post({
            ...req.body,
            sender: _id
        });
        req.body = post
        await post.save();
        res.status(201).send(post);
    } catch (err) {
        res.status(400).send(err);
    }
};

// Define getPosts function
export const getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find();
        res.status(200).send(posts);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Define getPostById function
export const getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).send("Post not found");
            return;
        }
        res.status(200).send(post);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Define updatePost function
export const updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            res.status(404).send("Post not found");
            return;
        }
        res.status(200).send(post);
    } catch (err) {
        res.status(400).send(err);
    }
};

// Define deletePost function
export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            res.status(404).send("Post not found");
            return;
        }
        res.status(200).send(post);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Define getPostsBySender function
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
        res.status(500).send({ error: "Failed to fetch posts by sender", details: err });
    }
};
