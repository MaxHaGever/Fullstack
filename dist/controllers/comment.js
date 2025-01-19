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
exports.deleteComment = exports.updateComment = exports.getCommentsByPost = exports.getComments = exports.createComment = void 0;
const comment_1 = __importDefault(require("../models/comment"));
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, text } = req.body;
        const sender = req.query.userId;
        if (!postId || !text || !sender) {
            res.status(400).send("Missing required fields: postId, text, or sender");
            return;
        }
        const comment = new comment_1.default({ postId, text, sender });
        yield comment.save();
        res.status(201).send(comment);
    }
    catch (err) {
        console.error("Error creating comment:", err);
        res.status(500).send("Internal Server Error");
    }
});
exports.createComment = createComment;
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield comment_1.default.find();
        res.status(200).send(comments);
    }
    catch (err) {
        res.status(500).send({ error: "Failed to fetch comments", details: err });
    }
});
exports.getComments = getComments;
const getCommentsByPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield comment_1.default.find({ postId: req.params.postId });
        res.status(200).send(comments);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.getCommentsByPost = getCommentsByPost;
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield comment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) {
            res.status(404).send("Comment not found");
            return;
        }
        res.status(200).send(comment);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.updateComment = updateComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield comment_1.default.findByIdAndDelete(req.params.id);
        if (!comment) {
            res.status(404).send("Comment not found");
            return;
        }
        res.status(200).send(comment);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.deleteComment = deleteComment;
//# sourceMappingURL=comment.js.map