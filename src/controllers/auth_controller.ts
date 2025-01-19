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

    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }

    try {
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            res.status(400).send("Email already registered");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await Users.create({
            email,
            password: hashPassword,
        });

        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET!,
            { expiresIn: process.env.TOKEN_EXPIRATION || "1h" }
        );

        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET!,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "1d" }
        );

        user.refreshTokens = [refreshToken];
        await user.save();

        res.status(200).send({
            user: {
                email: user.email,
                _id: user._id,
            },
            accessToken,
            refreshToken,
        });
    } catch (err) {
        res.status(400).send(err);
    }
};



const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }

    try {
        const user = await Users.findOne({ email });
        if (!user) {
            res.status(400).send("User not found");
            return;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(400).send("Invalid email or password");
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).send("Missing Token Secret");
            return;
        }

        const random = Math.floor(Math.random() * 1000000000) + 1;

        const accessToken = jwt.sign(
            { _id: user._id,
                random: random
             },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || "1h" }
        );

        const refreshToken = jwt.sign(
            { _id: user._id,
            random: random
            },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "1d" } 
        );

        if(user.refreshTokens == null){
            user.refreshTokens = []
        }
        user.refreshTokens.push(refreshToken)
        await user.save();
         res.status(200).send({
            email: user.email,
            _id: user._id,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (err) {
        console.error("Error in login:", err);
        res.status(500).send(err);
        
    }
};

const logout = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    console.log("Logout request received with refresh token:", refreshToken);

    if (!refreshToken) {
        console.log("Missing refresh token in request body");
        res.status(400).send("Missing refresh token");
        return;
    }

    if (!process.env.TOKEN_SECRET) {
        console.log("Missing TOKEN_SECRET");
        res.status(500).send("Missing token secret");
        return;
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET) as CustomJwtPayload;
        const user = await Users.findOne({ _id: decoded._id });
        if (!user) {
            res.status(400).send("User not found");
            return;
        }

        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            res.status(400).send("Invalid refresh token");
            return;
        }

        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        await user.save();
        res.status(200).send("Logged out successfully");
    } catch (err) {
        console.error("Error during logout:", err);
        res.status(403).send("Invalid refresh token");
    }
};




const refresh = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;

    console.log("Received refresh token:", refreshToken); // Debug input token

    if (!refreshToken) {
        res.status(400).send("Missing refresh token");
        return;
    }

    if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Missing token secret");
        return;
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET) as CustomJwtPayload;
        console.log("Decoded payload:", decoded); // Debug decoded payload

        const user = await Users.findOne({ _id: decoded._id });
        if (!user) {
            res.status(400).send("User not found");
            return;
        }

        console.log("User's current refresh tokens:", user.refreshTokens); // Debug user's refresh tokens

        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            console.log("Invalid or reused refresh token");
            res.status(400).send("Invalid refresh token");
            return;
        }

        // Remove the current refresh token
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        console.log("Updated refresh tokens after removal:", user.refreshTokens); // Debug token removal

        // Generate new tokens
        const newAccessToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || "1h" }
        );

        const newRefreshToken = jwt.sign(
            { _id: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "1d" }
        );

        user.refreshTokens.push(newRefreshToken);
        console.log("New refresh token added:", newRefreshToken); // Debug new refresh token
        await user.save();

        res.status(200).send({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        console.error("Error in refresh endpoint:", err); // Debug any errors
        res.status(403).send("Invalid or expired refresh token");
    }
};


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log("Authorization Header:", authHeader); // Debug log
    console.log("Extracted Token:", token);          // Debug log

    if (!token) {
        res.status(401).json({ error: "Missing token" });
        return;
    }

    if (!process.env.TOKEN_SECRET) {
        res.status(500).json({ error: "Server misconfiguration: Missing token secret" });
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.error("Token verification failed:", err); // Debug log
            res.status(403).json({ error: "Invalid token" });
            return;
        }

        console.log("Token verified successfully"); // Debug log
        const decodedPayload = payload as CustomJwtPayload;
        req.query.userId = decodedPayload._id;
        next();
    });
};




export default {register,login, logout, refresh};