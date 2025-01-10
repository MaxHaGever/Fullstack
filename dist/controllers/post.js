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
// Define createPost function
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _id = req.query.userId;
        const post = new post_1.default(Object.assign(Object.assign({}, req.body), { sender: _id }));
        req.body = post;
        yield post.save();
        res.status(201).send(post);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.createPost = createPost;
// Define getPosts function
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_1.default.find();
        res.status(200).send(posts);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.getPosts = getPosts;
// Define getPostById function
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).send("Post not found");
            return;
        }
        res.status(200).send(post);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.getPostById = getPostById;
// Define updatePost function
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            res.status(404).send("Post not found");
            return;
        }
        res.status(200).send(post);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.updatePost = updatePost;
// Define deletePost function
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findByIdAndDelete(req.params.id);
        if (!post) {
            res.status(404).send("Post not found");
            return;
        }
        res.status(200).send(post);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.deletePost = deletePost;
// Define getPostsBySender function
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
        res.status(500).send({ error: "Failed to fetch posts by sender", details: err });
    }
});
exports.getPostsBySender = getPostsBySender;
//# sourceMappingURL=post.js.map