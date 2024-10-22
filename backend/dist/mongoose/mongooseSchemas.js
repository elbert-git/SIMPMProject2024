"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingDataModel = exports.RoomDataModel = exports.UserDataModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// schemas
const userDataSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    isStaff: { type: Boolean, required: true },
    hashedPassword: { type: String, required: true },
    activeAccessToken: String,
}, { minimize: false });
const BookingDataSchema = new mongoose_1.default.Schema({
    bookerUserName: { type: String, required: true },
    bookerEmail: { type: String, required: true },
    roomId: { type: String, required: true },
    time: { type: Number, required: true },
}, { minimize: false });
const roomDataSchema = new mongoose_1.default.Schema({
    roomId: { type: String, required: true, unique: true },
    roomName: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    pricePerHour: { type: Number, required: true },
    roomCapacity: { type: String, required: true },
    promoCodes: { type: Object, required: true },
}, { minimize: false });
// models
exports.UserDataModel = mongoose_1.default.model("UserData", userDataSchema);
exports.RoomDataModel = mongoose_1.default.model("RoomData", roomDataSchema);
exports.BookingDataModel = mongoose_1.default.model("bookingData", BookingDataSchema);
