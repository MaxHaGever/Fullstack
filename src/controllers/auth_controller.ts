import { Request, Response, NextFunction } from "express";
import Users from "../models/user_model"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config();
import { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
    _id: string;
}

const register = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    console.log("Register Request Body:", req.body); // Debug incoming request

    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }

    try {
        const existingUser = await Users.findOne({ email }); // Check if email already exists
        if (existingUser) {
            console.log("Registration Failed: Email already exists"); // Debug duplicate registration
            return res.status(400).send("Email already registered");
        }

        const salt = await bcrypt.genSalt(10);
        console.log("Salt generated for password:", salt); // Debug salt generation

        const hashPassword = await bcrypt.hash(password, salt);
        console.log("Hashed Password:", hashPassword); // Debug hashed password

        const user = await Users.create({
            email: email,
            password: hashPassword,
        });

        console.log("User Created:", user); // Debug created user
        return res.status(200).send(user);
    } catch (err) {
        console.error("Error during registration:", err); // Debug errors
        return res.status(400).send(err);
    }
};


const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).send("Missing email or password");
    }

    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).send("User not found");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send("Invalid email or password");
        }

        if (!process.env.TOKEN_SECRET) {
            return res.status(500).send("Missing Token Secret");
        }

        const token = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || "1h" }
        );

        console.log("Generated Token:", token);

        return res.status(200).send({
            email: user.email,
            _id: user._id,
            token,
        });
    } catch (err) {
        console.error("Error in login:", err);
        return res.status(500).send(err);
    }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log("Authorization Header:", authHeader); // Debug authorization header
    console.log("Extracted Token:", token); // Debug token

    if (!token) {
        res.status(401).send("Missing token");
        return;
    }

    if (!process.env.TOKEN_SECRET) {
        res.status(400).send("Missing token secret");
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.error("Token verification failed:", err); // Debug verification error
            res.status(403).send("Invalid token");
            return;
        }

        console.log("Token verified successfully"); // Debug token verification success

        // Assert payload is of type CustomJwtPayload
        const decodedPayload = payload as CustomJwtPayload;

        req.query.userId = decodedPayload._id; // Now TypeScript recognizes _id
        next();
    });
};




export default {register,login};