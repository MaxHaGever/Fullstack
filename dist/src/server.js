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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const Posts_routes_1 = __importDefault(require("./Routes/Posts_routes"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const initApp = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Check for DB_CONNECTION environment variable
            if (!process.env.DB_CONNECTION) {
                console.error("DB_CONNECTION is not set");
                reject(new Error("DB_CONNECTION is not set"));
                return;
            }
            // Connect to the database
            yield mongoose_1.default.connect(process.env.DB_CONNECTION);
            console.log("Connected to DB");
            // Set up middleware
            app.use(body_parser_1.default.json());
            app.use(body_parser_1.default.urlencoded({ extended: true }));
            // Set up routes
            app.use("/posts", Posts_routes_1.default);
            console.log("initApp finished successfully");
            resolve(app);
        }
        catch (error) {
            console.error("Error during app initialization:", error);
            reject(error);
        }
    }));
});
exports.default = initApp;
//# sourceMappingURL=server.js.map