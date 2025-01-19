import express, { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";
import {
    createPost,
    getPosts,
    getPostById,
    getPostsBySender,
    updatePost,
    deletePost,
} from "../controllers/post";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Add a new post
 *     security:
 *       - bearerAuth: []
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the post
 *                 example: My First Post
 *               content:
 *                 type: string
 *                 description: Content of the post
 *                 example: This is the content of my first post
 *     responses:
 *       200:
 *         description: Post added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: My First Post
 *                 content:
 *                   type: string
 *                   example: This is the content of my first post
 *                 owner:
 *                   type: string
 *                   example: 60d5ec9b6f4b3b0015f3f7b3
 *                 _id:
 *                   type: string
 *                   example: 60d5ec9b6f4b3b0015f3f7b4
 *       401:
 *         description: Unauthorized access
 */

router.post("/", authMiddleware, createPost);

router.get("/", getPosts);
router.get("/by-sender", getPostsBySender);
router.get("/:id", getPostById);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
