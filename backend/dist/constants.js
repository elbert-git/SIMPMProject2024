"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const constants = {
    jwt_secret: process.env.JWT_SECRET,
    mongoose_password: process.env.MONGOOSE_PASSWORD
};
exports.default = constants;
