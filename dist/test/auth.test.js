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
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const user_model_1 = __importDefault(require("../models/user_model"));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    yield mongoose_1.default.connect(dbURI);
    yield user_model_1.default.deleteMany();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
}));
const userInfo = {
    email: "maxspector@gmail.com",
    password: "123456",
};
describe("Auth Tests", () => {
    test("Auth Registration", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).post("/auth/register").send(userInfo);
        console.log("Registration Response Body:", response.body); // Debug response body
        expect(response.statusCode).toBe(200);
    }));
    test("Auth Login", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send(userInfo);
        console.log("Login Response Status:", loginResponse.statusCode); // Debug status code
        console.log("Login Response Body:", loginResponse.body); // Debug response body
        expect(loginResponse.statusCode).toBe(200);
        const token = loginResponse.body.token;
        expect(token).toBeDefined();
        const userId = loginResponse.body._id;
        expect(userId).toBeDefined();
        console.log("Token from Login:", token); // Debug token
        console.log("User ID from Login:", userId); // Debug user ID
        userInfo.token = token;
        userInfo._id = userId;
    }));
    test("Get protected API", () => __awaiter(void 0, void 0, void 0, function* () {
        // First request: Without Authorization
        const response = yield (0, supertest_1.default)(app_1.default)
            .post("/posts")
            .send({
            sender: userInfo._id,
            title: "My First Post",
            content: "This is my first post",
        });
        console.log("Unauthorized Response Status:", response.statusCode); // Debug status code
        console.log("Unauthorized Response Body:", response.body); // Debug response body
        expect(response.statusCode).not.toBe(201);
        // Second request: With Authorization
        const response2 = yield (0, supertest_1.default)(app_1.default)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
            sender: userInfo._id,
            title: "My First Post",
            content: "This is my first post",
        });
        console.log("Authorized Response Status:", response2.statusCode); // Debug status code
        console.log("Authorized Response Body:", response2.body); // Debug response body
        expect(response2.statusCode).toBe(201);
    }));
});
//# sourceMappingURL=auth.test.js.map