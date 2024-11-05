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
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const mongooseDatabase_1 = require("./mongoose/mongooseDatabase");
const utilities_1 = require("./utilities");
const expressApp = (0, express_1.default)();
expressApp.use(express_1.default.json());
expressApp.use((0, cors_1.default)({
    origin: '*' // put urls you want here
}));
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
        // delete sensitive data
        const cleanedAuthRes = {
            status: authRes.status,
            accessToken: authRes.accessToken,
            credentials: {
                email: authRes.credentials.email,
                userName: authRes.credentials.userName,
                isStaff: authRes.credentials.isStaff,
            }
        };
        res.status(200).json(cleanedAuthRes);
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
function AuthenticateStaff(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("attempt to authenticate staff");
        try {
            const token = req.headers["authorization"].split(" ")[1];
            const authRes = yield auth_1.default.verifyJwt(token);
            if (authRes.status === "ok") {
                req.email = authRes.decodedData.email;
                const userDoc = yield mongooseDatabase_1.MongooseDatabase.users.getUser(authRes.decodedData.email);
                if (userDoc.isStaff === true) {
                    next();
                }
                else {
                    res.status(400).json({
                        status: "failed",
                        message: "User is not authorized",
                    });
                }
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
function AuthenticateStudent(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("attempt to authenticate student");
        try {
            const token = req.headers["authorization"].split(" ")[1];
            const authRes = yield auth_1.default.verifyJwt(token);
            if (authRes.status === "ok") {
                req.email = authRes.decodedData.email;
                const userDoc = yield mongooseDatabase_1.MongooseDatabase.users.getUser(authRes.decodedData.email);
                if (userDoc.isStaff === false) {
                    next();
                }
                else {
                    res.status(400).json({
                        status: "failed",
                        message: "User is not authorized",
                    });
                }
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
function Authenticate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("attempt to authenticate");
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
expressApp.post("/createRoom", AuthenticateStaff, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get user data
        const getUser = yield mongooseDatabase_1.MongooseDatabase.users.getUser(req.email);
        // make sure is staff
        if (!getUser.isStaff) {
            throw "User is not authorized to do this action";
        }
        // get data from body
        const roomDetails = {
            roomName: req.body.roomName,
            roomCapacity: req.body.roomCapacity,
            roomId: (0, utilities_1.generateRandomString)(10),
            isActive: false,
            pricePerHour: req.body.pricePerHour,
            promoCodes: req.body.promoCodes,
        };
        const result = yield mongooseDatabase_1.MongooseDatabase.rooms.createRoom(roomDetails);
        res
            .status(200)
            .send({ status: "ok", message: `${roomDetails.roomName} created` });
    }
    catch (error) {
        res.status(500).send({ status: "failed", message: error });
    }
}));
expressApp.get("/getAllRooms", Authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get rooms
        const rooms = yield mongooseDatabase_1.MongooseDatabase.rooms.getAllRooms();
        res.status(200).json({ status: "ok", message: "got all rooms", rooms });
    }
    catch (error) {
        res.status(500).send({ status: "failed", message: error });
    }
}));
expressApp.get("/getRoom", Authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get rooms
        const room = yield mongooseDatabase_1.MongooseDatabase.rooms.getRoom(req.body.roomId);
        res.status(200).json({ status: "ok", message: "got room", room });
    }
    catch (error) {
        res.status(500).send({ status: "failed", message: error });
    }
}));
expressApp.delete("/deleteRoom", AuthenticateStaff, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get user data
        const getUser = yield mongooseDatabase_1.MongooseDatabase.users.getUser(req.email);
        // make sure is staff
        if (!getUser.isStaff) {
            throw "User is not authorized to do this action";
        }
        // get rooms
        const result = yield mongooseDatabase_1.MongooseDatabase.rooms.deleteRoom(req.body.roomId);
        res.status(200).json(result);
    }
    catch (error) {
        res
            .status(500)
            .send({ status: "failed", message: error.toString() });
    }
}));
expressApp.post("/updateRoom", AuthenticateStaff, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get user data
        const getUser = yield mongooseDatabase_1.MongooseDatabase.users.getUser(req.email);
        // make sure is staff
        if (!getUser.isStaff) {
            throw "User is not authorized to do this action";
        }
        // get rooms
        const roomId = req.body.roomId;
        const changes = req.body.changes;
        const result = yield mongooseDatabase_1.MongooseDatabase.rooms.updateRoom(roomId, changes);
        res.status(200).json(result);
    }
    catch (error) {
        res
            .status(500)
            .send({ status: "failed", message: error.toString() });
    }
}));
expressApp.post("/createBooking", AuthenticateStudent, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get user data
        const getUser = yield mongooseDatabase_1.MongooseDatabase.users.getUser(req.email);
        // make sure is student
        if (getUser.isStaff !== false) {
            throw "User is not authorized to do this action";
        }
        const result = yield mongooseDatabase_1.MongooseDatabase.bookings.createBookings(req.body.email, req.body.roomId, req.body.time);
        res
            .status(200)
            .send({ status: "ok", message: "booking was created", result });
    }
    catch (error) {
        res
            .status(500)
            .send({ status: "failed", message: error.toString() });
    }
}));
expressApp.get("/getBookingsByRoomId", Authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield mongooseDatabase_1.MongooseDatabase.bookings.getBookingsByRoomId(req.body.roomId);
        res.status(200).send({ status: "ok", message: "got bookings", bookings });
    }
    catch (error) {
        res
            .status(500)
            .send({ status: "failed", message: error.toString() });
    }
}));
expressApp.get("/getBookingsByUserEmail", Authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield mongooseDatabase_1.MongooseDatabase.bookings.getBookingsByUserEmail(req.body.email);
        res.status(200).send({ status: "ok", message: "got bookings", bookings });
    }
    catch (error) {
        res
            .status(500)
            .send({ status: "failed", message: error.toString() });
    }
}));
expressApp.delete("/deleteBooking", AuthenticateStudent, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        mongooseDatabase_1.MongooseDatabase.bookings.deleteBooking(req.body.id);
        res.status(200).send({ status: "ok", message: "booking was deleted" });
    }
    catch (error) {
        res
            .status(500)
            .send({ status: "failed", message: error.toString() });
    }
}));
expressApp.post("/updateBooking", AuthenticateStudent, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get rooms
        const bookingId = req.body.id;
        const changes = req.body.changes;
        const result = yield mongooseDatabase_1.MongooseDatabase.bookings.updateBooking(bookingId, changes);
        res.status(200).json(result);
    }
    catch (error) {
        res
            .status(500)
            .send({ status: "failed", message: error.toString() });
    }
}));
exports.default = expressApp;
