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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const base = process.env.DOMAIN_BASE || "http://localhost:3004/";
// ✅ Ensure files are stored in `public/uploads/`
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/"); // ✅ Save files in "public/uploads/"
    },
    filename: function (req, file, cb) {
        const ext = path_1.default.extname(file.originalname);
        cb(null, Date.now() + ext); // ✅ Use timestamp + original extension
    }
});
const upload = (0, multer_1.default)({ storage });
router.post("/", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        // ✅ Correctly construct the public file URL
        const fileUrl = `${base}uploads/${req.file.filename}`;
        console.log("File uploaded:", fileUrl);
        res.status(200).json({ url: fileUrl });
    }
    catch (error) {
        console.error("Error in file upload:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
module.exports = router;
//# sourceMappingURL=file_routes.js.map