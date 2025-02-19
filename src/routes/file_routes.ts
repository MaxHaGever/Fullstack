import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";

// ✅ Extend Express Request to recognize `file`
declare module "express-serve-static-core" {
    interface Request {
        file?: Express.Multer.File;
    }
}

const router = express.Router();
const base = process.env.DOMAIN_BASE || "http://localhost:3004/";

// ✅ Ensure files are stored in `public/uploads/`
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/"); // ✅ Save files in "public/uploads/"
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // ✅ Use timestamp + original extension
    }
});

const upload = multer({ storage });

router.post("/", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        // ✅ Correctly construct the public file URL
        const fileUrl = `${base}uploads/${req.file.filename}`;
        console.log("File uploaded:", fileUrl);

        res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error("Error in file upload:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export = router;
