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
const mongooseSchemas_1 = require("./mongooseSchemas");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = __importDefault(require("../constants"));
class MongooseDB {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mongoose_1.default.connect(MongooseDB.url);
            console.log('connected to mongoose');
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
}
MongooseDB.url = `mongodb+srv://elbertnathanaeltkg:${constants_1.default.mongoose_password}@cluster0.lahxp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
exports.default = MongooseDB;
