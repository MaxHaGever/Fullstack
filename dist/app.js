"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const student_routes_1 = __importDefault(require("./routes/student_routes"));
const post_routes_1 = __importDefault(require("./routes/post_routes")); // Import Post routes
const comment_routes_1 = __importDefault(require("./routes/comment_routes")); // Import Comment routes
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
dotenv_1.default.config();
const dbURI = process.env.dbURI;
if (!dbURI) {
    throw new Error("Database connection string (dbURI) is not defined");
}
console.log("Starting app setup...");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Load routes
app.use("/students", student_routes_1.default);
app.use("/posts", post_routes_1.default); // Add Post routes
app.use("/comments", comment_routes_1.default);
app.use("/auth", auth_routes_1.default); // Add Comment routes
// Connect to the database
mongoose_1.default
    .connect(dbURI, {})
    .then(() => {
    console.log("DB connected");
})
    .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1); // Exit if the DB connection fails
});
exports.default = app;
//# sourceMappingURL=app.js.map