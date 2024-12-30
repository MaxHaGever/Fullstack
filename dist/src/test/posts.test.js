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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = __importDefault(require("../models/post_model"));
const testPosts = [
    {
        "title": "Test Post 1",
        "content": "Test content 1",
        "owner": "Max"
    },
    {
        "title": "Test Post 2",
        "content": "Test content 2",
        "owner": "Max2"
    }
];
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("beforeAll");
    app = yield (0, server_1.default)();
    yield post_model_1.default.deleteMany();
}));
afterAll((done) => {
    console.log("afterAll");
    mongoose_1.default.connection.close();
    done();
});
describe("Posts Test", () => {
    test("DB Empty test", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Test 1");
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    }));
    test("Test create new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/posts").send(testPosts[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(testPosts[0].title);
        expect(response.body.content).toBe(testPosts[0].content);
        expect(response.body.owner).toBe(testPosts[0].owner);
    }));
    test("Test create new post 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/posts").send(testPosts[1]);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(testPosts[1].title);
        expect(response.body.content).toBe(testPosts[1].content);
        expect(response.body.owner).toBe(testPosts[1].owner);
    }));
    test("DB Full", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Test 1");
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    }));
});
//# sourceMappingURL=posts.test.js.map