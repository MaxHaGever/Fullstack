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
const post_1 = __importDefault(require("../models/post"));
const comment_1 = __importDefault(require("../models/comment"));
const user_model_1 = __importDefault(require("../models/user_model"));
const userInfo = {
    email: "maxspectorr@gmail.com",
    password: "123456",
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    yield mongoose_1.default.connect(dbURI);
    yield post_1.default.deleteMany();
    yield comment_1.default.deleteMany();
    yield user_model_1.default.deleteMany();
    yield (0, supertest_1.default)(app_1.default).post("/auth/register").send(userInfo);
    const response = yield (0, supertest_1.default)(app_1.default).post("/auth/login").send(userInfo);
    userInfo.token = response.body.token;
    userInfo._id = response.body._id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
// Tests for Post and Comment APIs
describe("Post and Comment API Tests", () => {
    let post1Id;
    let post2Id;
    let comment1Id;
    let comment2Id;
    test("POST /posts - Should create posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const post1 = yield (0, supertest_1.default)(app_1.default)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ title: "Post 1", content: "Content 1" });
        post1Id = post1.body._id;
        expect(post1.statusCode).toEqual(201);
        const post2 = yield (0, supertest_1.default)(app_1.default)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ title: "Post 2", content: "Content 2" });
        post2Id = post2.body._id;
        expect(post2.statusCode).toEqual(201);
    }));
    test("POST /comments - Should create comments for a post", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("post1Id:", post1Id); // Debug log
        console.log("userInfo.token:", userInfo.token); // Debug log
        const comment1 = yield (0, supertest_1.default)(app_1.default)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
            postId: post1Id,
            text: "Comment 1",
        });
        console.log("Comment 1 Response:", comment1.body); // Debug log
        comment1Id = comment1.body._id;
        expect(comment1.statusCode).toEqual(201);
        const comment2 = yield (0, supertest_1.default)(app_1.default)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
            postId: post1Id,
            text: "Comment 2",
        });
        console.log("Comment 2 Response:", comment2.body); // Debug log
        comment2Id = comment2.body._id;
        expect(comment2.statusCode).toEqual(201);
    }));
    test("GET /posts - Should get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get("/posts");
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    }));
    test("GET /posts/:id - Should get a single post", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get(`/posts/${post1Id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual("Post 1");
    }));
    test("GET /comments - Should get all comments", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get("/comments");
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    }));
    test("DELETE /posts/:id - Should delete a post", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).delete(`/posts/${post2Id}`)
            .set("Authorization", `Bearer ${userInfo.token}`);
        expect(res.statusCode).toEqual(200);
    }));
    test("DELETE /comments/:id - Should delete a comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).delete(`/comments/${comment2Id}`)
            .set("Authorization", `Bearer ${userInfo.token}`);
        expect(res.statusCode).toEqual(200);
    }));
    test("UPDATE /posts - Should update a post", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedPost = yield (0, supertest_1.default)(app_1.default)
            .put(`/posts/${post1Id}`)
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ title: "Updated Post 1", content: "Updated Content 1" });
        expect(updatedPost.statusCode).toEqual(200);
        expect(updatedPost.body.title).toEqual("Updated Post 1");
    }));
    test("UPDATE /comments/:id - Should update a comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedComment = yield (0, supertest_1.default)(app_1.default)
            .put(`/comments/${comment1Id}`)
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ text: "Updated Comment 1" });
        expect(updatedComment.statusCode).toEqual(200);
        expect(updatedComment.body.text).toEqual("Updated Comment 1");
    }));
});
//# sourceMappingURL=test.test.js.map