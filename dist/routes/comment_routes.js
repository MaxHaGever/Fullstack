"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_1 = require("../controllers/comment");
const router = express_1.default.Router();
// Define routes
router.post("/", comment_1.createComment); // Create a comment
router.get("/post/:postId", comment_1.getCommentsByPost); // Get comments by post ID
router.get("/", comment_1.getComments); // Get all comments
router.put("/:id", comment_1.updateComment); // Update a comment by ID
router.delete("/:id", comment_1.deleteComment); // Delete a comment by ID
exports.default = router;
//# sourceMappingURL=comment_routes.js.map