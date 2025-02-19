"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const userSchema = new Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        require: true
    },
    refreshTokens: {
        type: [String],
        default: []
    },
    avatar: {
        required: false,
        type: String,
    },
});
const Users = mongoose_1.default.model("Users", userSchema);
exports.default = Users;
//# sourceMappingURL=user_model.js.map