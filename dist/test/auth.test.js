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
const student_1 = __importDefault(require("../../src/models/student"));
const post_1 = __importDefault(require("../../src/models/post"));
const comment_1 = __importDefault(require("../../src/models/comment"));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    yield mongoose_1.default.connect(dbURI);
    // Clean the database
    yield student_1.default.deleteMany();
    yield post_1.default.deleteMany();
    yield comment_1.default.deleteMany();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
}));
describe("Student API Tests", () => {
    let student1Id;
    let student2Id;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const student1 = yield (0, supertest_1.default)(app_1.default).post("/students").send({
            id: "111111",
            name: "Alice",
        });
        student1Id = student1.body._id;
        const student2 = yield (0, supertest_1.default)(app_1.default).post("/students").send({
            id: "222222",
            name: "Bob",
        });
        student2Id = student2.body._id;
    }));
    test("GET /students - Should get all students", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get("/students");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        const studentNames = res.body.map((student) => student.name);
        expect(studentNames).toContain("Alice");
        expect(studentNames).toContain("Bob");
    }));
    test("GET /students/:id - Should get student by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get(`/students/${student1Id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", student1Id);
        expect(res.body).toHaveProperty("name", "Alice");
        expect(res.body).toHaveProperty("id", "111111");
    }));
    test("PUT /students/:id - Should update a student", () => __awaiter(void 0, void 0, void 0, function* () {
        const newName = "Alice Updated";
        const res = yield (0, supertest_1.default)(app_1.default).put(`/students/${student1Id}`).send({
            name: newName,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", student1Id);
        expect(res.body).toHaveProperty("name", newName);
        const verifyRes = yield (0, supertest_1.default)(app_1.default).get(`/students/${student1Id}`);
        expect(verifyRes.body).toHaveProperty("name", newName);
    }));
    test("DELETE /students/:id - Should delete a student", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).delete(`/students/${student2Id}`);
        expect(res.statusCode).toEqual(200);
        const verifyRes = yield (0, supertest_1.default)(app_1.default).get(`/students/${student2Id}`);
        expect(verifyRes.statusCode).toEqual(404);
    }));
});
describe("Post and Comment API Tests", () => {
    let post1Id;
    let post2Id;
    let comment1Id;
    let comment2Id;
    // Add initial data for posts and comments
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const post1 = yield (0, supertest_1.default)(app_1.default).post("/posts").send({
            title: "Post 1",
            content: "Content of post 1",
            sender: "User1",
        });
        post1Id = post1.body._id;
        const post2 = yield (0, supertest_1.default)(app_1.default).post("/posts").send({
            title: "Post 2",
            content: "Content of post 2",
            sender: "User2",
        });
        post2Id = post2.body._id;
        const comment1 = yield (0, supertest_1.default)(app_1.default).post("/comments").send({
            postId: post1Id,
            text: "Comment 1 on post 1",
            sender: "User3",
        });
        comment1Id = comment1.body._id;
        const comment2 = yield (0, supertest_1.default)(app_1.default).post("/comments").send({
            postId: post1Id,
            text: "Comment 2 on post 1",
            sender: "User4",
        });
        comment2Id = comment2.body._id;
    }));
    // --- POST Tests ---
    test("GET /posts - Should get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get("/posts");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        // Explicitly type posts
        const posts = res.body;
        expect(posts.length).toBeGreaterThanOrEqual(2);
    }));
    test("GET /posts/:id - Should get post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get(`/posts/${post1Id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", post1Id);
        expect(res.body).toHaveProperty("title", "Post 1");
    }));
    test("PUT /posts/:id - Should update a post", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedTitle = "Updated Post 1";
        const res = yield (0, supertest_1.default)(app_1.default).put(`/posts/${post1Id}`).send({
            title: updatedTitle,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", post1Id);
        expect(res.body).toHaveProperty("title", updatedTitle);
    }));
    test("DELETE /posts/:id - Should delete a post", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).delete(`/posts/${post2Id}`);
        expect(res.statusCode).toEqual(200);
        const verifyRes = yield (0, supertest_1.default)(app_1.default).get(`/posts/${post2Id}`);
        expect(verifyRes.statusCode).toEqual(404);
    }));
    // --- COMMENT Tests ---
    test("GET /comments - Should get all comments", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get("/comments");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        // Explicitly type comments
        const comments = res.body;
        expect(comments.length).toBeGreaterThanOrEqual(2);
    }));
    test("GET /comments/post/:postId - Should get comments by post ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get(`/comments/post/${post1Id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    }));
    test("PUT /comments/:id - Should update a comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedText = "Updated Comment 1";
        const res = yield (0, supertest_1.default)(app_1.default).put(`/comments/${comment1Id}`).send({
            text: updatedText,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", comment1Id);
        expect(res.body).toHaveProperty("text", updatedText);
    }));
    test("DELETE /comments/:id - Should delete a comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).delete(`/comments/${comment2Id}`);
        expect(res.statusCode).toEqual(200);
        const verifyRes = yield (0, supertest_1.default)(app_1.default).get(`/comments/${comment2Id}`);
        expect(verifyRes.statusCode).toEqual(404);
    }));
});
//# sourceMappingURL=auth.test.js.map