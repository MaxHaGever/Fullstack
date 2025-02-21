import { Request, Response } from "express";
import Post from "../models/post";
import Comment from "../models/comment";

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
            .populate({
                path: "comments",
                select: "_id", // ✅ Only fetch `_id` to optimize performance
            })
            .exec(); // ✅ Ensures full execution of query

        // ✅ Fetch the actual count of comments using aggregation
        const postsWithCommentCount = await Promise.all(
            posts.map(async (post) => {
                const commentCount = await Comment.countDocuments({ postId: post._id });
                return {
                    _id: post._id,
                    title: post.title,
                    content: post.content,
                    sender: post.sender,
                    senderUsername: post.senderUsername, // ✅ If applicable
                    image: post.image,
                    likes: post.likes,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    commentCount, // ✅ Correctly count comments using aggregation
                };
            })
        );

        res.status(200).json(postsWithCommentCount); // ✅ Send response with comment count
    } catch (err) {
        console.error("❌ Error fetching posts:", err);
        res.status(500).json({ error: "Failed to fetch posts", details: err });
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
        console.log("📥 Incoming Update Request:", req.body);
        console.log("🔍 Post ID:", req.params.id);
        console.log("📸 Uploaded Image:", req.file);

        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }

        // ✅ Update title and content
        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;

        // ✅ Handle image upload
        if (req.file) {
            post.image = `/public/postimages/${req.file.filename}`;
            console.log("✅ Image Updated:", post.image);
        }

        await post.save();
        console.log("✅ Post Updated Successfully:", post);
        res.status(200).json(post);
    } catch (err) {
        console.error("❌ Error updating post:", err);
        res.status(500).send({ error: "Failed to update post", details: err.message });
    }
};

import fs from "fs";
import path from "path";

export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }

        // ✅ Delete the image file from the server
        if (post.image) {
            const imagePath = path.join(__dirname, "..", post.image);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("⚠️ Error deleting image file:", err);
                } else {
                    console.log("✅ Image file deleted:", imagePath);
                }
            });
        }

        // ✅ Delete the post from the database
        await Post.findByIdAndDelete(req.params.id);
        console.log("✅ Post deleted:", post._id);

        res.status(200).json({ message: "Post deleted successfully", post });
    } catch (err) {
        console.error("❌ Error deleting post:", err);
        res.status(500).send({ error: "Failed to delete post", details: err.message });
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
