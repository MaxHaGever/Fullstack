import { Request, Response } from "express";
import Comment from "../models/comment"



export const createComment = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("📥 Incoming Comment Request:", req.body);

        const { postId, text } = req.body;
        const userId = req.query.userId as string; // ✅ Extract user ID from token

        if (!postId || !text || !userId) {
            res.status(400).send({ error: "Missing required fields: postId, text, or user ID" });
            return;
        }

        const comment = new Comment({ postId, text, sender: userId });
        await comment.save();

        console.log("✅ Comment Created Successfully:", comment);
        res.status(201).send(comment);
    } catch (err) {
        console.error("🚨 Error creating comment:", err);
        res.status(500).send({ error: "Internal Server Error", details: err });
    }
};









export const getComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const comments = await Comment.find();
        res.status(200).send(comments);
    } catch (err) {
        res.status(500).send({ error: "Failed to fetch comments", details: err });
    }
};

export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(`🔍 Fetching comments for postId: ${req.params.postId}`);

        const comments = await Comment.find({ postId: req.params.postId })
            .populate("sender", "username") // ✅ Fetch username instead of ID
            .exec();

        res.status(200).send(comments);
    } catch (err) {
        console.error("❌ Error fetching comments by post:", err);
        res.status(500).send({ error: "Failed to fetch comments", details: err });
    }
};






export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) {
            res.status(404).send("Comment not found");
            return;
        }
        res.status(200).send(comment);
    } catch (err) {
        res.status(400).send(err);
    }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const commentId = req.params.id;
        const userId = req.query.userId as string; // ✅ Get user ID from token

        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).send({ error: "Comment not found" });
            return;
        }

        // ✅ Ensure only the comment owner can delete it
        if (comment.sender.toString() !== userId) {
            res.status(403).send({ error: "Unauthorized: You can only delete your own comments" });
            return;
        }

        await Comment.findByIdAndDelete(commentId);
        res.status(200).send({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting comment:", err);
        res.status(500).send({ error: "Failed to delete comment", details: err });
    }
};


