import express, { Request } from "express";
const router = express.Router();
import multer from "multer";


const base = process.env.DOMAIN_BASE || "http://localhost:3004/";
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
       cb(null, 'public/')
   },
   filename: function (req, file, cb) {
       const ext = file.originalname.split('.')
           .filter(Boolean)
           .slice(1)
           .join('.')
       cb(null, Date.now() + "." + ext)
   }
})
const upload = multer({ storage: storage });

interface MulterRequest extends Request {
    file: multer.File;
}

router.post('/', upload.single("file"), function (req: MulterRequest, res) {
   console.log("router.post(/file: " + base + req.file?.path)
   res.status(200).send({ url: new URL(req.file?.path, base).href });
});
export = router;