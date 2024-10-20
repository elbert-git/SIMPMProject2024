"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userDataSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    userName: { type: String, required: true },
    isStaff: { type: Boolean, required: true },
    hashedPassword: { type: String, required: true },
    activeAccessToken: String,
});
exports.UserDataModel = mongoose_1.default.model('UserData', userDataSchema);
