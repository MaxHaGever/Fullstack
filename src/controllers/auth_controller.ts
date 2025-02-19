import { Request, Response, NextFunction } from "express";
import Users from "../models/user_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
    _id: string;
}

const register = async (req: Request, res: Response) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        res.status(400).send("Missing username, email, or password");
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
            username,
            avatar: req.body.avatar || null, 
        });

        console.log("✅ User Created in DB:", user);

        // ✅ Modify response structure (remove `user` wrapper)
        res.status(200).json({
            _id: user._id, 
            email: user.email,
            username: user.username, 
        });
    } catch (err) {
        res.status(500).send({ message: "Internal server error", error: err });
    }
};



const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

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
            {
                _id: user._id,
                random: random,
            },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || "1h" }
        );

        const refreshToken = jwt.sign(
            {
                _id: user._id,
                random: random,
            },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "1d" }
        );

        if (user.refreshTokens == null) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(200).send({
            email: user.email,
            username: user.username, 
            _id: user._id,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (err) {
        console.error("Error in login:", err);
        res.status(500).send(err);
    }
};

const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, avatar } = req.body;

        if (!userId || !avatar) {
            res.status(400).json({ message: "Missing userId or avatar URL" });
            return;
        }

        const user = await Users.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        user.avatar = avatar;
        await user.save();

        console.log(`✅ User ${user.username} updated with new avatar: ${avatar}`);

        res.status(200).json({ message: "Profile updated successfully", avatar });
    } catch (err) {
        console.error("❌ Error updating profile:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
};


const logout = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;

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
        await user.save();

        res.status(200).send({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        console.error("Error in refresh endpoint:", err);
        res.status(403).send("Invalid or expired refresh token");
    }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

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
            res.status(403).json({ error: "Invalid token" });
            return;
        }

        const decodedPayload = payload as CustomJwtPayload;
        req.query.userId = decodedPayload._id;
        next();
    });
};

export default { register, login, logout, refresh, updateProfile };
