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
    const { email, password, username } = req.body;
    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }
    try {
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).send("Email already registered");
            return;
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashPassword = yield bcrypt_1.default.hash(password, salt);
        if (!req.body.avatar)
            req.body.avatar = null;
        const user = yield user_model_1.default.create({
            email,
            password: hashPassword,
            username,
            avatar: req.body.avatar,
        });
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "1d" });
        user.refreshTokens = [refreshToken];
        yield user.save();
        res.status(200).send({
            user: {
                email: user.email,
                username: user.username,
                _id: user._id,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
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
        const accessToken = jsonwebtoken_1.default.sign({
            _id: user._id,
            random: random,
        }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({
            _id: user._id,
            random: random,
        }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "1d" });
        if (user.refreshTokens == null) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push(refreshToken);
        yield user.save();
        res.status(200).send({
            email: user.email,
            username: user.username,
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
        const newAccessToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || "1h" });
        const newRefreshToken = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "1d" });
        user.refreshTokens.push(newRefreshToken);
        yield user.save();
        res.status(200).send({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (err) {
        console.error("Error in refresh endpoint:", err);
        res.status(403).send("Invalid or expired refresh token");
    }
});
const authMiddleware = (req, res, next) => {
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
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
            return;
        }
        const decodedPayload = payload;
        req.query.userId = decodedPayload._id;
        next();
    });
};
exports.authMiddleware = authMiddleware;
exports.default = { register, login, logout, refresh };
//# sourceMappingURL=auth_controller.js.map