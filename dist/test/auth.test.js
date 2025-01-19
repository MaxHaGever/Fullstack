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
const post_1 = __importDefault(require("../models/post"));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    yield mongoose_1.default.connect(dbURI);
    yield user_model_1.default.deleteMany();
    yield post_1.default.deleteMany();
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
        expect(response.statusCode).toBe(200);
    }));
    test("Auth Registration fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).post("/auth/register").send(userInfo);
        expect(response.statusCode).not.toBe(200);
    }));
    test("Auth Login", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send(userInfo);
        expect(loginResponse.statusCode).toBe(200);
        const accessToken = loginResponse.body.accessToken;
        expect(accessToken).toBeDefined();
        const refreshToken = loginResponse.body.refreshToken;
        expect(refreshToken).toBeDefined();
        const userId = loginResponse.body._id;
        expect(userId).toBeDefined();
        userInfo.accessToken = accessToken;
        userInfo.refreshToken = refreshToken;
        userInfo._id = userId;
    }));
    test("Get protected API", () => __awaiter(void 0, void 0, void 0, function* () {
        // First request: Without Authorization
        const response = yield (0, supertest_1.default)(app_1.default)
            .post("/posts")
            .send({
            sender: "invalid",
            title: "My First Post",
            content: "This is my first post",
        });
        console.log("Unauthorized Response Status:", response.statusCode); // Debug status code
        console.log("Unauthorized Response Body:", response.body); // Debug response body
        expect(response.statusCode).not.toBe(201);
        // Second request: With Authorization
        const response2 = yield (0, supertest_1.default)(app_1.default)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.accessToken}`)
            .send({
            sender: "invalid",
            title: "My First Post",
            content: "This is my first post",
        });
        console.log("Authorized Response Status:", response2.statusCode); // Debug status code
        console.log("Authorized Response Body:", response2.body); // Debug response body
        expect(response2.statusCode).toBe(201);
    }));
    test("Get protected API invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        // First request: Without Authorization
        const response = yield (0, supertest_1.default)(app_1.default)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.accessToken + '1'}`)
            .send({
            sender: userInfo._id,
            title: "My First Post",
            content: "This is my first post",
        });
        console.log("Unauthorized Response Status:", response.statusCode); // Debug status code
        console.log("Unauthorized Response Body:", response.body); // Debug response body
        expect(response.statusCode).not.toBe(201);
    }));
    test("Refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const refreshResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/refresh").send({ refreshToken: userInfo.refreshToken });
        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body.accessToken).toBeDefined();
        expect(refreshResponse.body.refreshToken).toBeDefined();
        userInfo.accessToken = refreshResponse.body.accessToken;
        userInfo.refreshToken = refreshResponse.body.refreshToken;
    }));
    test("Logout", () => __awaiter(void 0, void 0, void 0, function* () {
        const logoutResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/logout").send({ refreshToken: userInfo.refreshToken });
        expect(logoutResponse.statusCode).toBe(200);
        const refreshResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/refresh").send({ refreshToken: userInfo.refreshToken });
        expect(refreshResponse.statusCode).not.toBe(200);
    }));
    test("Refresh tokenm multiuple usage", () => __awaiter(void 0, void 0, void 0, function* () {
        //login - get refresh token
        const refreshResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send({ email: userInfo.email, password: userInfo.password });
        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body.accessToken).toBeDefined();
        expect(refreshResponse.body.refreshToken).toBeDefined();
        userInfo.accessToken = refreshResponse.body.accessToken;
        userInfo.refreshToken = refreshResponse.body.refreshToken;
        //first usage of token
        const response2 = yield (0, supertest_1.default)(app_1.default).post("/auth/refresh").send({ refreshToken: userInfo.refreshToken });
        expect(response2.statusCode).toBe(200);
        const newRefreshToken = response2.body.refreshToken;
        //2nd usage of refresh token expectin to fail
        const response3 = yield (0, supertest_1.default)(app_1.default).post("/auth/refresh").send({ refreshToken: userInfo.refreshToken });
        expect(response3.statusCode).not.toBe(200);
        //try the new refresh token expect to fail
        const response4 = yield (0, supertest_1.default)(app_1.default).post("/auth/refresh").send({ refreshToken: newRefreshToken });
        expect(response4.statusCode).not.toBe(200);
    }));
});
//# sourceMappingURL=auth.test.js.map