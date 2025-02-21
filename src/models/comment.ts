import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IComment extends Document {
    postId: Types.ObjectId; 
    text: string;
    sender: Types.ObjectId;  // ✅ Fix TypeScript Error
    createdAt?: Date; 
    updatedAt?: Date;
}

const commentSchema: Schema<IComment> = new Schema(
    {
        postId: { type: Schema.Types.ObjectId, ref: "Post", required: true }, 
        text: { type: String, required: true },
        sender: { type: Schema.Types.ObjectId, ref: "Users", required: true }, // ✅ Fixed TypeScript Issue
    },
    { timestamps: true }
);

const Comment: Model<IComment> = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
