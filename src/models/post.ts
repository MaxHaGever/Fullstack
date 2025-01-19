import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPost extends Document {
    title: string;
    content: string;
    sender: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const postSchema: Schema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        sender: { type: String, required: true },
    },
    { timestamps: true } 
);

const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default Post;
