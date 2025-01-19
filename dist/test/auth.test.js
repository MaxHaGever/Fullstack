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
    username: "maxspectorr",
};
describe("Auth Tests", () => {
    test("Auth Registration", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).post("/auth/register").send(userInfo);
        expect(response.statusCode).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.username).toBe(userInfo.username);
    }));
    test("Auth Registration fail (duplicate email)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).post("/auth/register").send(userInfo);
        expect(response.statusCode).not.toBe(200);
    }));
    test("Auth Login", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send({
            email: userInfo.email,
            password: userInfo.password,
        });
        expect(loginResponse.statusCode).toBe(200);
        const { accessToken, refreshToken, _id, username } = loginResponse.body;
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        expect(_id).toBeDefined();
        expect(username).toBe(userInfo.username);
        userInfo.accessToken = accessToken;
        userInfo.refreshToken = refreshToken;
        userInfo._id = _id;
    }));
    test("Auth Login fail (invalid password)", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send({
            email: userInfo.email,
            password: userInfo.password + "1",
        });
        expect(loginResponse.statusCode).not.toBe(200);
    }));
    test("Ensure tokens are unique", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse1 = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send(userInfo);
        const loginResponse2 = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send(userInfo);
        expect(loginResponse1.body.accessToken).not.toBe(loginResponse2.body.accessToken);
        expect(loginResponse1.body.refreshToken).not.toBe(loginResponse2.body.refreshToken);
    }));
    test("Get protected API (unauthorized)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).post("/posts").send({
            title: "Unauthorized Post",
            content: "This should fail",
        });
        expect(response.statusCode).toBe(401);
    }));
    test("Get protected API (authorized)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.accessToken}`)
            .send({
            title: "Authorized Post",
            content: "This should succeed",
        });
        expect(response.statusCode).toBe(201);
    }));
    test("Get protected API (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.accessToken}1`)
            .send({
            title: "Invalid Token Post",
            content: "This should fail",
        });
        expect(response.statusCode).toBe(403);
    }));
    test("Refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const refreshResponse = yield (0, supertest_1.default)(app_1.default)
            .post("/auth/refresh")
            .send({ refreshToken: userInfo.refreshToken });
        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body.accessToken).toBeDefined();
        expect(refreshResponse.body.refreshToken).toBeDefined();
        userInfo.accessToken = refreshResponse.body.accessToken;
        userInfo.refreshToken = refreshResponse.body.refreshToken;
    }));
    test("Logout", () => __awaiter(void 0, void 0, void 0, function* () {
        const logoutResponse = yield (0, supertest_1.default)(app_1.default)
            .post("/auth/logout")
            .send({ refreshToken: userInfo.refreshToken });
        expect(logoutResponse.statusCode).toBe(200);
        const refreshResponse = yield (0, supertest_1.default)(app_1.default)
            .post("/auth/refresh")
            .send({ refreshToken: userInfo.refreshToken });
        expect(refreshResponse.statusCode).toBe(400);
    }));
    test("Prevent multiple refresh token usage", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send(userInfo);
        const initialRefreshToken = loginResponse.body.refreshToken;
        const firstRefresh = yield (0, supertest_1.default)(app_1.default)
            .post("/auth/refresh")
            .send({ refreshToken: initialRefreshToken });
        expect(firstRefresh.statusCode).toBe(200);
        const reusedRefresh = yield (0, supertest_1.default)(app_1.default)
            .post("/auth/refresh")
            .send({ refreshToken: initialRefreshToken });
        expect(reusedRefresh.statusCode).toBe(400);
    }));
    test("Timeout refresh token (simulate expiration)", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send(userInfo);
        const refreshToken = loginResponse.body.refreshToken;
        const refreshResponse = yield (0, supertest_1.default)(app_1.default)
            .post("/auth/refresh")
            .send({ refreshToken });
        expect(refreshResponse.statusCode).toBe(200);
    }));
});
//# sourceMappingURL=auth.test.js.map