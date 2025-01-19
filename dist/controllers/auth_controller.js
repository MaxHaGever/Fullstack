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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const user_model_1 = __importDefault(require("../models/user_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    console.log("Register Request Body:", req.body); // Debug incoming request
    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }
    try {
        const existingUser = yield user_model_1.default.findOne({ email }); // Check if email already exists
        if (existingUser) {
            console.log("Registration Failed: Email already exists"); // Debug duplicate registration
            res.status(400).send("Email already registered");
            return;
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        console.log("Salt generated for password:", salt); // Debug salt generation
        const hashPassword = yield bcrypt_1.default.hash(password, salt);
        console.log("Hashed Password:", hashPassword); // Debug hashed password
        const user = yield user_model_1.default.create({
            email: email,
            password: hashPassword,
        });
        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            res.status(400).send("User not found");
            return;
        }
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(400).send("Invalid email or password");
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send("Missing Token Secret");
            return;
        }
        const random = Math.floor(Math.random() * 1000000000) + 1;
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id,
            random: random
        }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id,
            random: random
        }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "1d" });
        if (user.refreshTokens == null) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push(refreshToken);
        yield user.save();
        res.status(200).send({
            email: user.email,
            _id: user._id,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    }
    catch (err) {
        console.error("Error in login:", err);
        res.status(500).send(err);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET);
        const user = yield user_model_1.default.findOne({ _id: decoded._id });
        if (!user) {
            res.status(400).send("User not found");
            return;
        }
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            res.status(400).send("Invalid refresh token");
            return;
        }
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        yield user.save();
        res.status(200).send("Logged out successfully");
    }
    catch (err) {
        console.error("Error during logout:", err);
        res.status(403).send("Invalid refresh token");
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET);
        console.log("Decoded payload:", decoded); // Debug decoded payload
        const user = yield user_model_1.default.findOne({ _id: decoded._id });
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
        const newAccessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || "1h" });
        const newRefreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "1d" });
        user.refreshTokens.push(newRefreshToken);
        console.log("New refresh token added:", newRefreshToken); // Debug new refresh token
        yield user.save();
        res.status(200).send({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (err) {
        console.error("Error in refresh endpoint:", err); // Debug any errors
        res.status(403).send("Invalid or expired refresh token");
    }
});
const authMiddleware = (req, res, next) => {
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
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.error("Token verification failed:", err); // Debug verification error
            res.status(403).send("Invalid token");
            return;
        }
        console.log("Token verified successfully"); // Debug token verification success
        // Assert payload is of type CustomJwtPayload
        const decodedPayload = payload;
        req.query.userId = decodedPayload._id; // Now TypeScript recognizes _id
        next();
    });
};
exports.authMiddleware = authMiddleware;
exports.default = { register, login, logout, refresh };
//# sourceMappingURL=auth_controller.js.map