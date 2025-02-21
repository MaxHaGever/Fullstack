import { Request, Response } from "express";
import Post from "../models/post";

// Create a new post
export const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("💾 Incoming Request Body:", req.body);
        console.log("📸 Uploaded File:", req.file);
        console.log("🔐 User ID from JWT:", req.query.userId);

        const userId = req.query.userId as string;
        const { title, content, username } = req.body; // ✅ Retrieve username

        if (!userId || !username) {
            console.error("❌ Missing User ID or Username");
            res.status(401).json({ error: "Unauthorized: User ID or Username not found" });
            return;
        }

        if (!title || !content) {
            console.error("❌ Missing title or content");
            res.status(400).json({ error: "Title and content are required" });
            return;
        }

        const imagePath = req.file ? `/public/postimages/${req.file.filename}` : null;

        const post = new Post({
            title,
            content,
            sender: userId,
            senderUsername: username, // ✅ Store username in database
            image: imagePath,
            likes: 0,
        });

        await post.save();
        console.log("✅ Post Created Successfully:", post);
        res.status(201).json(post); // ✅ Explicit return
        return;
    } catch (err) {
        console.error("🚨 Error creating post:", err);
        res.status(500).json({ error: "Failed to create post", details: err.message });
        return;
    }
};









// Get all posts with comments populated
export const getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find()
            .populate("comments") // Populate the comments field
            .exec();

        res.status(200).send(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send({ error: "Failed to fetch posts", details: err });
    }
};

// Get a specific post by ID
export const getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("comments"); // Populate comments for the specific post
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

// Like a post
export const likePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }

        post.likes += 1; // Increment likes
        await post.save();

        res.status(200).send(post);
    } catch (err) {
        console.error("Error liking post:", err);
        res.status(500).send({ error: "Failed to like post", details: err });
    }
};

// Update a post
export const updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("📥 Incoming Update Request:", req.body); // ✅ Log request body
        console.log("🔍 Post ID:", req.params.id); // ✅ Log post ID

        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }

        console.log("✅ Post Updated Successfully:", post); // ✅ Confirm update
        res.status(200).send(post);
    } catch (err) {
        console.error("❌ Error updating post:", err);
        res.status(400).send({ error: "Failed to update post", details: err.message });
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

// Get posts by sender (user)
export const getPostsBySender = async (req: Request, res: Response): Promise<void> => {
    try {
        const senderId = req.query.sender as string; // Get sender ID from query parameters
        if (!senderId) {
            res.status(400).send({ error: "Sender ID is required" });
            return;
        }

        const posts = await Post.find({ sender: senderId }).populate("comments");
        res.status(200).send(posts);
    } catch (err) {
        console.error("Error fetching posts by sender:", err);
        res.status(500).send({ error: "Failed to fetch posts by sender", details: err });
    }
};
