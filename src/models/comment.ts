import mongoose, { Document, Schema, Model } from "mongoose";

export interface IComment extends Document {
    postId: mongoose.Schema.Types.ObjectId; 
    text: string;
    sender: string;
    createdAt?: Date; 
    updatedAt?: Date;
}

const commentSchema: Schema<IComment> = new Schema(
    {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        text: { type: String, required: true },
        sender: { type: String, required: true },
    },
    { timestamps: true } 
);

const Comment: Model<IComment> = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
