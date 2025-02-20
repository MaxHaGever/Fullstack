import mongoose, { Document, Schema, Model } from "mongoose";
import { IComment } from "./comment"; // Import the Comment interface

export interface IPost extends Document {
    title: string;
    content: string;
    sender: string;
    createdAt?: Date;
    updatedAt?: Date;
    comments: IComment[]; // Add this line for the comments field
    likes?: number;
}

const postSchema: Schema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        sender: { type: String, required: true },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Define comments as an array of ObjectId referencing Comment
        likes: { type: Number, default: 0 }, // Default likes to 0
    },
    { timestamps: true }
);

const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default Post;
