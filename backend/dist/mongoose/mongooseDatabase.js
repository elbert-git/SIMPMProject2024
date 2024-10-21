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
exports.MongooseDatabase = void 0;
const mongooseSchemas_1 = require("./mongooseSchemas");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = __importDefault(require("../constants"));
class MongooseDB {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mongoose_1.default.connect(MongooseDB.url);
            console.log("connected to mongoose");
        });
    }
    static getUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield mongooseSchemas_1.UserDataModel.find({ email });
            return user[0];
        });
    }
    static saveNewUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //  verify unique user
                const getUser = yield MongooseDB.getUser(userData.email);
                if (getUser !== undefined) {
                    throw "user with email already exists";
                }
                // create new document
                const userDoc = new mongooseSchemas_1.UserDataModel(Object.assign({}, userData));
                // save
                userDoc.save();
                // return status
                return { status: "ok", message: `new user ${userData.userName} created` };
            }
            catch (e) {
                return { status: "failed", message: e };
            }
        });
    }
    static getRoom(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield mongooseSchemas_1.RoomDataModel.find({ roomId });
            return room[0];
        });
    }
    static getAllRooms() {
        return __awaiter(this, void 0, void 0, function* () {
            const rooms = yield mongooseSchemas_1.RoomDataModel.find({});
            return rooms;
        });
    }
    static createRoom(roomData) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomDoc = new mongooseSchemas_1.RoomDataModel(roomData);
            yield roomDoc.save();
            return {
                status: "ok",
                message: `${roomData.roomName} has been created`,
                roomData,
            };
        });
    }
    static deleteRoom(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield MongooseDB.getRoom(roomId);
            if (!room) {
                throw "room doesn't exist";
            }
            yield mongooseSchemas_1.RoomDataModel.findOneAndDelete({ roomId });
            return {
                status: "ok",
                message: `${room.roomName} has been deleted`,
            };
        });
    }
    static updateRoom(roomId, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            // get room
            const room = yield MongooseDB.getRoom(roomId);
            if (!room) {
                throw "room doesnt exist";
            }
            // update all relevant keys
            const keys = Object.keys(changes);
            keys.forEach((key) => {
                room[key] = changes[key];
            });
            yield room.save();
            // return status
            return { status: "ok", message: `${room.roomName} was updated` };
        });
    }
}
MongooseDB.url = `mongodb+srv://elbertnathanaeltkg:${constants_1.default.mongoose_password}@cluster0.lahxp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
exports.default = MongooseDB;
exports.MongooseDatabase = {
    users: {
        getUser: MongooseDB.getUser,
        saveNewUser: MongooseDB.saveNewUser,
    },
    rooms: {
        createRoom: MongooseDB.createRoom,
        getRoom: MongooseDB.getRoom,
        getAllRooms: MongooseDB.getAllRooms,
        deleteRoom: MongooseDB.deleteRoom,
        updateRoom: MongooseDB.updateRoom,
    },
    bookings: {},
};
