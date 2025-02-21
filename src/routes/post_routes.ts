import express, { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
    createPost,
    getPosts,
    getPostById,
    getPostsBySender,
    updatePost,
    deletePost,
    toggleLike,
} from "../controllers/post";

const router: Router = express.Router();

// ✅ Ensure `public/postimages/` directory exists before using multer
const uploadPath = path.join(__dirname, "../public/postimages/");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true }); // ✅ Create folder if missing
}

// ✅ Configure `multer` to store images in `public/postimages/`
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, "post-" + Date.now() + path.extname(file.originalname)); // ✅ Unique file name
    },
});

const upload = multer({ storage });

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Add a new post (with optional image)
 *     security:
 *       - bearerAuth: []
 *     tags: [Posts]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the post
 *                 example: "My First Post"
 *               content:
 *                 type: string
 *                 description: Content of the post
 *                 example: "This is the content of my first post"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: (Optional) Image file
 *     responses:
 *       201:
 *         description: Post added successfully
 *       401:
 *         description: Unauthorized access
 */
router.post("/", authMiddleware, upload.single("image"), createPost);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retrieves all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of all posts
 */
router.get("/", getPosts);

/**
 * @swagger
 * /posts/by-sender:
 *   get:
 *     summary: Retrieves posts by sender
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the sender to filter posts
 *     responses:
 *       200:
 *         description: A list of posts by the sender
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
 */
router.get("/:id", getPostById);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Updates a post by ID
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Post Title"
 *               content:
 *                 type: string
 *                 example: "Updated Post Content"
 *     responses:
 *       200:
 *         description: The updated post
 */


router.put("/:id", authMiddleware, upload.single("image"), updatePost);


/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Deletes a post by ID
 *     security:
 *       - bearerAuth: []
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
 */
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/like", authMiddleware, toggleLike);


export default router;
