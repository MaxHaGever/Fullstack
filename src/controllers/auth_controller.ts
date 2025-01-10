import { Request, Response } from "express";

const register = async (req: Request, res: Response) => {
    const email = req.body.email
    const password = req.body.password
    res.status(400).send("Not implemented")
}

const login = async (req: Request, res: Response) => {
    const email = req.body.email
    const password = req.body.password
    res.status(400).send("Not implemented")
}

export default {register,login};