import mongoose, { Document, Schema, Model } from "mongoose";
import { IComment } from "./comment"; // Import the Comment interface

export interface IPost extends Document {
    title: string;
    content: string;
    sender: string;
    senderUsername: string; // ✅ Add senderUsername
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
    comments: IComment[];
    likes?: number;
}

const postSchema: Schema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        sender: { type: String, required: true },
        senderUsername: { type: String, required: true }, // ✅ Add senderUsername
        image: { type: String, default: null },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        likes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default Post;
