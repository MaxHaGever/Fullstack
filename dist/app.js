"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const post_routes_1 = __importDefault(require("./routes/post_routes")); // Import Post routes
const comment_routes_1 = __importDefault(require("./routes/comment_routes")); // Import Comment routes
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const file_routes_1 = __importDefault(require("./routes/file_routes"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Web dev 2025 REST API",
            version: "1.0.0",
            description: "REST server including authentication",
        },
        servers: [{ url: "http://localhost:3004" }],
    },
    apis: ["./src/routes/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
dotenv_1.default.config();
const dbURI = process.env.dbURI;
if (!dbURI) {
    throw new Error("Database connection string (dbURI) is not defined");
}
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});
app.use("/posts", post_routes_1.default);
app.use("/comments", comment_routes_1.default);
app.use("/auth", auth_routes_1.default);
app.use("/public", express_1.default.static("public"));
app.use("/uploads", express_1.default.static("public/uploads"));
app.use("/file", file_routes_1.default);
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // ✅ Allow frontend origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // ✅ Allow cookies & authentication headers
}));
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "public")));
mongoose_1.default
    .connect(dbURI, {})
    .then(() => {
    console.log("DB connected");
})
    .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=app.js.map