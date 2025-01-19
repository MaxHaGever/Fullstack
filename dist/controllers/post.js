"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsBySender = exports.deletePost = exports.updatePost = exports.getPostById = exports.getPosts = exports.createPost = void 0;
const post_1 = __importDefault(require("../models/post")); // Assuming Post is exported as a default TypeScript module
// Create a post
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.query.userId;
        // Validate userId and required fields
        if (!userId) {
            res.status(400).send({ error: "User ID is required" });
            return;
        }
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).send({ error: "Title and content are required" });
            return;
        }
        // Create a new post
        const post = new post_1.default({
            title,
            content,
            sender: userId, // Associate post with the sender
        });
        yield post.save();
        res.status(201).send(post); // Respond with the created post
    }
    catch (err) {
        console.error("Error creating post:", err); // Log error for debugging
        res.status(500).send({ error: "Failed to create post", details: err });
    }
});
exports.createPost = createPost;
// Get all posts
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_1.default.find();
        res.status(200).send(posts);
    }
    catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send({ error: "Failed to fetch posts", details: err });
    }
});
exports.getPosts = getPosts;
// Get a single post by ID
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }
        res.status(200).send(post);
    }
    catch (err) {
        console.error("Error fetching post by ID:", err);
        res.status(500).send({ error: "Failed to fetch post by ID", details: err });
    }
});
exports.getPostById = getPostById;
// Update a post
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }
        res.status(200).send(post);
    }
    catch (err) {
        console.error("Error updating post:", err);
        res.status(400).send({ error: "Failed to update post", details: err });
    }
});
exports.updatePost = updatePost;
// Delete a post
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findByIdAndDelete(req.params.id);
        if (!post) {
            res.status(404).send({ error: "Post not found" });
            return;
        }
        res.status(200).send(post);
    }
    catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).send({ error: "Failed to delete post", details: err });
    }
});
exports.deletePost = deletePost;
// Get posts by sender ID
const getPostsBySender = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderId = req.query.sender; // Get sender ID from query parameters
        if (!senderId) {
            res.status(400).send({ error: "Sender ID is required" });
            return;
        }
        const posts = yield post_1.default.find({ sender: senderId });
        res.status(200).send(posts);
    }
    catch (err) {
        console.error("Error fetching posts by sender:", err);
        res.status(500).send({ error: "Failed to fetch posts by sender", details: err });
    }
});
exports.getPostsBySender = getPostsBySender;
//# sourceMappingURL=post.js.map