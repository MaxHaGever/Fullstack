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
const app_1 = __importDefault(require("../app"));
const mongoose_1 = __importDefault(require("mongoose"));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    yield mongoose_1.default.connect(dbURI);
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
}));
describe("File Tests", () => {
    test("upload file", () => __awaiter(void 0, void 0, void 0, function* () {
        const filePath = `${__dirname}/test_file.txt`;
        console.log(`Uploading file: ${filePath}`);
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/file")
                .attach("file", filePath);
            expect(response.statusCode).toEqual(200);
            let url = response.body.url;
            console.log(`Uploaded file URL: ${url}`);
            // Extract relative path correctly
            const urlObject = new URL(url);
            const relativePath = urlObject.pathname;
            // Fetch the uploaded file
            const res = yield (0, supertest_1.default)(app_1.default).get(relativePath);
            expect(res.statusCode).toEqual(200);
        }
        catch (err) {
            console.error("Test failed:", err);
            expect(1).toEqual(2);
        }
    }));
});
//# sourceMappingURL=file.test.js.map