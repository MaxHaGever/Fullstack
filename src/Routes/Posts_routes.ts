import express from "express";
const router = express.Router();
import Post from "../controllers/post_controller"


router.get("/", Post.getAllPosts);
router.get("/:id", Post.getPostbyId)
router.post("/", Post.createPost);
router.delete("/:id",Post.deletePost);

export default router;