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
const auth_1 = __importDefault(require("./auth"));
const mongooseDatabase_1 = require("./mongoose/mongooseDatabase");
const expressApp = (0, express_1.default)();
expressApp.use(express_1.default.json());
// ---------------------------------- room stuff
// register
expressApp.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("register endpoint hit");
    try {
        const newUserData = {
            email: req.body.email,
            userName: req.body.userName,
            password: req.body.password,
            isStaff: req.body.isStaff,
        };
        const registerRes = yield auth_1.default.register(newUserData);
        res.status(200).json({
            status: "ok",
            message: `userName: ${registerRes.userName} registered`,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ status: "failed", message: e });
    }
}));
// login
expressApp.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("login endpoint hit");
    try {
        const userLogin = {
            email: req.body.email,
            password: req.body.password,
        };
        const authRes = yield auth_1.default.login(userLogin);
        res.status(200).json(authRes);
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ status: "failed", message: e });
    }
}));
// logout
expressApp.post("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("logout endpoint hit");
    try {
        const email = req.body.email;
        const authRes = yield auth_1.default.logout(email);
        res.status(200).json(authRes);
    }
    catch (e) {
        res.status(500).json({ status: "failed", message: e });
    }
}));
// authenticated routes
function Authenticate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("attempt to authenticat");
        try {
            const token = req.headers["authorization"].split(" ")[1];
            const authRes = yield auth_1.default.verifyJwt(token);
            if (authRes.status === "ok") {
                req.email = authRes.decodedData.email;
                next();
            }
            else {
                res.status(400).json({
                    status: "failed",
                    message: "user credentials don't check out",
                });
            }
        }
        catch (error) {
            res.status(500).json({
                status: "failed",
                message: "something went wrong with verification",
            });
        }
    });
}
// logout
expressApp.post("/restrictedRoute", Authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("restricted route hit");
    try {
        const userData = req.userData;
        res.status(200).json({
            status: "ok",
            message: `you are coming as ${req.email}`,
        });
    }
    catch (e) {
        res.status(500).json({ status: "failed", message: e });
    }
}));
// ---------------------------------- room stuff
expressApp.post("/createRoom", Authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get user data
        const getUser = yield mongooseDatabase_1.MongooseDatabase.users.getUser(req.email);
        //
    }
    catch (error) {
        res.status(500).send({ status: "failed", message: error });
    }
}));
exports.default = expressApp;
