import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface for a Comment document
export interface IComment extends Document {
    postId: mongoose.Schema.Types.ObjectId; // Reference to the Post model
    text: string;
    sender: string;
    createdAt?: Date; // Automatically added by Mongoose with timestamps
    updatedAt?: Date; // Automatically added by Mongoose with timestamps
}

// Define the schema for a Comment
const commentSchema: Schema<IComment> = new Schema(
    {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        text: { type: String, required: true },
        sender: { type: String, required: true },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create and export the Comment model
const Comment: Model<IComment> = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
