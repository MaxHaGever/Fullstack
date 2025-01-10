"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth_controller");
const post_1 = require("../controllers/post");
const router = express_1.default.Router();
// Specific routes should come first
router.get("/by-sender", post_1.getPostsBySender); // Get posts by sender
router.get("/:id", post_1.getPostById); // Get a post by ID
router.post("/", auth_controller_1.authMiddleware, (req, res, next) => {
    console.log("Request Body for Create Post:", req.body); // Debug request body
    next();
}, post_1.createPost);
router.get("/", post_1.getPosts); // Get all posts
router.put("/:id", auth_controller_1.authMiddleware, post_1.updatePost); // Update a post by ID
router.delete("/:id", auth_controller_1.authMiddleware, post_1.deletePost); // Delete a post by ID
exports.default = router;
//# sourceMappingURL=post_routes.js.map