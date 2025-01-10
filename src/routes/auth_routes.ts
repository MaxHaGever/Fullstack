import express, {Request, Response} from "express"
import authController from "../controllers/auth_controller"

const router = express.Router();

router.post("/register" , (req: Request, res: Response) => {
    authController.register(req,res)
})

router.post("/login" , (req: Request, res: Response) => {
    authController.login(req,res)
})

export default router