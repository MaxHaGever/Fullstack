import { Request, Response } from "express";
import Comment from "../models/comment"


export const createComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, text } = req.body;
        const sender = req.query.userId as string;


        if (!postId || !text || !sender) {
            res.status(400).send("Missing required fields: postId, text, or sender");
            return;
        }

        const comment = new Comment({ postId, text, sender });
        await comment.save();
        res.status(201).send(comment);
    } catch (err) {
        console.error("Error creating comment:", err); 
        res.status(500).send("Internal Server Error");
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
        const { postId } = req.params;
        console.log(`🔍 Fetching comments for post: ${postId}`);

        if (!postId) {
            res.status(400).send({ error: "Missing postId parameter" });
            return;
        }

        const comments = await Comment.find({ postId }).exec();
        if (!comments || comments.length === 0) {
            res.status(404).send({ error: "No comments found for this post" });
            return;
        }

        res.status(200).send(comments);
    } catch (err) {
        console.error("❌ Error fetching comments:", err);
        res.status(500).send(err);
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
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            res.status(404).send("Comment not found");
            return;
        }
        res.status(200).send(comment);
    } catch (err) {
        res.status(500).send(err);
    }
};

