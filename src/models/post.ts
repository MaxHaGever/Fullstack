import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface for the Post document
export interface IPost extends Document {
    title: string;
    content: string;
    sender: string;
    createdAt?: Date; // Optional because it's automatically managed by Mongoose
    updatedAt?: Date; // Optional because it's automatically managed by Mongoose
}

// Define the schema for the Post model
const postSchema: Schema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        sender: { type: String, required: true },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create and export the Post model
const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default Post;
