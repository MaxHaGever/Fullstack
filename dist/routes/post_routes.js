"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth_controller");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const post_1 = require("../controllers/post");
const router = express_1.default.Router();
// ✅ Ensure `public/postimages/` directory exists before using multer
const uploadPath = path_1.default.join(__dirname, "../public/postimages/");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true }); // ✅ Create folder if missing
}
// ✅ Configure `multer` to store images in `public/postimages/`
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, "post-" + Date.now() + path_1.default.extname(file.originalname)); // ✅ Unique file name
    },
});
const upload = (0, multer_1.default)({ storage });
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
router.post("/", auth_controller_1.authMiddleware, upload.single("image"), post_1.createPost);
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
router.get("/", post_1.getPosts);
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
router.get("/by-sender", post_1.getPostsBySender);
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
router.get("/:id", post_1.getPostById);
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
router.put("/:id", auth_controller_1.authMiddleware, post_1.updatePost);
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
router.delete("/:id", auth_controller_1.authMiddleware, post_1.deletePost);
exports.default = router;
//# sourceMappingURL=post_routes.js.map