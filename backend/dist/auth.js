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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongooseDatabase_1 = __importDefault(require("./mongoose/mongooseDatabase"));
const constants_1 = __importDefault(require("./constants"));
const jwtSecret = constants_1.default.jwt_secret;
class Auth {
    static register(newUserData) {
        return __awaiter(this, void 0, void 0, function* () {
            // check if user exist
            const getUser = yield mongooseDatabase_1.default.getUser(newUserData.email);
            if (getUser) {
                throw "user with email is taken";
            }
            // create hashed password
            const salt = yield bcrypt_1.default.genSalt();
            const hashedPassword = yield bcrypt_1.default.hash(newUserData.password, salt);
            // save to database
            const userData = {
                userName: newUserData.userName,
                hashedPassword,
                isStaff: newUserData.isStaff,
                email: newUserData.email,
                activeAccessToken: "",
            };
            mongooseDatabase_1.default.saveNewUser(userData);
            return userData;
        });
    }
    static login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            // check if user name exists
            const getUser = yield mongooseDatabase_1.default.getUser(credentials.email);
            if (!getUser) {
                throw "username doesn't exist";
            }
            // match passwords
            const match = yield bcrypt_1.default.compare(credentials.password, getUser.hashedPassword);
            // if match create keys
            if (match) {
                // create token
                const accessToken = jsonwebtoken_1.default.sign({ email: credentials.email }, jwtSecret);
                // save active token
                getUser.activeAccessToken = accessToken;
                yield getUser.save();
                // return token
                return {
                    status: "ok",
                    message: `${credentials.email} is logged in`,
                    accessToken: accessToken,
                };
            }
            // else return error
            else {
                throw "credentials dont check out";
            }
        });
    }
    static logout(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // check if user name exists
            const getUser = yield mongooseDatabase_1.default.getUser(email);
            if (!getUser) {
                throw "username with email doesn't exist";
            }
            // remove user active key
            getUser.activeAccessToken = "";
            yield getUser.save();
            //return status
            return {
                status: "ok",
                message: `user with email ${email} has been logged out`,
            };
        });
    }
    static verifyJwt(token) {
        return __awaiter(this, void 0, void 0, function* () {
            // attempt to decode
            const decodedData = Auth.decodeJwt(token);
            if (decodedData) {
                // check if key is active
                const getUser = yield mongooseDatabase_1.default.getUser(decodedData.email);
                const match = getUser.activeAccessToken === token;
                if (match) {
                    return { status: "ok", message: "verified successfully", decodedData };
                }
                else {
                    // token is inactive therefor suspicious
                    console.log("inactive token used, revoking access");
                    //revoke current active token
                    getUser.activeAccessToken = "";
                    yield getUser.save();
                    //return
                    return { status: "failed", message: "token expired" };
                }
            }
            else {
                // could not decode
                return { status: "failed", message: "failed to verify" };
            }
        });
    }
    static decodeJwt(token) {
        let result = null;
        jsonwebtoken_1.default.verify(token, jwtSecret, (err, data) => {
            if (err) {
                result = null;
            }
            else {
                result = data;
            }
        });
        return result;
    }
}
exports.default = Auth;
