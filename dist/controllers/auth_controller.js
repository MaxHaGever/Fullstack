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
    if (!email || !password) {
        res.status(400).send("Missing email or password");
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashPassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield user_model_1.default.create({
            email: email,
            password: hashPassword,
        });
        return res.status(200).send(user);
    }
    catch (err) {
        return res.status(400).send(err);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return res.status(400).send("Missing email or password");
    }
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).send("User not found");
        }
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send("Invalid email or password");
        }
        if (!process.env.TOKEN_SECRET) {
            return res.status(500).send("Missing Token Secret");
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION || "1h" });
        console.log("Generated Token:", token);
        return res.status(200).send({
            email: user.email,
            _id: user._id,
            token,
        });
    }
    catch (err) {
        console.error("Error in login:", err);
        return res.status(500).send(err);
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
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err) => {
        if (err) {
            console.error("Token verification failed:", err); // Debug verification error
            res.status(403).send("Invalid token");
            return;
        }
        console.log("Token verified successfully"); // Debug token verification success
        next();
    });
};
exports.authMiddleware = authMiddleware;
exports.default = { register, login };
//# sourceMappingURL=auth_controller.js.map