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
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retrieves all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized access
 */
router.get("/", getPosts);
/**
 * @swagger
 * /posts/by-sender:
 *   get:
 *     summary: Retrieves posts by sender
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of posts by the sender
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized access
 */
router.get("/by-sender", getPostsBySender);
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Retrieves a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: The requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Post not found
 */
router.get("/:id", getPostById);
/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Updates a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: The updated post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Post not found
 */
router.put("/:id", authMiddleware, updatePost);
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Deletes a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post deleted successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Post not found
 */
router.delete("/:id", authMiddleware, deletePost);

export default router;
