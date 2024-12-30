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
const { json } = require("body-parser");
const post_model_1 = __importDefault(require("../models/post_model"));
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ownerFilter = req.query.owner;
    try {
        if (ownerFilter) {
            const posts = yield post_model_1.default.find({ owner: ownerFilter });
            res.status(200).send(posts);
        }
        else {
            const posts = yield post_model_1.default.find();
            res.status(200).send(posts);
        }
    }
    catch (error) {
        res.status(400).send(error);
    }
});
const getPostbyId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postID = req.params.id;
    try {
        const post = yield post_model_1.default.findById(postID);
        res.status(200).send(post);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const post = req.body;
    try {
        const newPost = yield post_model_1.default.create(post);
        res.status(201).send(newPost);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postID = req.params.id;
    try {
        const post = yield post_model_1.default.deleteOne({ _id: postID });
        res.status(200).send(post);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.default = { getAllPosts, createPost, deletePost, getPostbyId };
//# sourceMappingURL=post_controller.js.map