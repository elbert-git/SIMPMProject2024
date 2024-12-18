import cors from "cors";
import express, { NextFunction, Request, Response, response } from "express";
import Auth from "./auth";
import Database from "./database";
import {
    BookingDataModel,
    NewUserData,
    RoomData,
} from "./mongoose/mongooseSchemas";
import MongooseDB, { MongooseDatabase } from "./mongoose/mongooseDatabase";
import { generateRandomString } from "./utilities";

const expressApp = express();
expressApp.use(express.json());
expressApp.use(
    cors({
        origin: "*", // put urls you want here
    })
);

expressApp.use('/', express.static('./public'));

// ---------------------------------- room stuff
// register
expressApp.post("/register", async (req, res) => {
    console.log("register endpoint hit");
    try {
        const newUserData: NewUserData = {
            email: req.body.email,
            userName: req.body.userName,
            password: req.body.password,
            isStaff: req.body.isStaff,
        };
        const registerRes = await Auth.register(newUserData);
        res.status(200).json({
            status: "ok",
            message: `userName: ${registerRes.userName} registered`,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ status: "failed", message: e });
    }
});

// login
expressApp.post("/login", async (req, res) => {
    console.log("login endpoint hit");
    try {
        const userLogin = {
            email: req.body.email,
            password: req.body.password,
        };
        const authRes = await Auth.login(userLogin);
        // delete sensitive data
        const cleanedAuthRes = {
            status: authRes.status,
            accessToken: authRes.accessToken,
            credentials: {
                email: authRes.credentials.email,
                userName: authRes.credentials.userName,
                isStaff: authRes.credentials.isStaff,
            },
        };
        res.status(200).json(cleanedAuthRes);
    } catch (e) {
        console.log(e);
        res.status(500).json({ status: "failed", message: e });
    }
});

// logout
expressApp.post("/logout", async (req, res) => {
    console.log("logout endpoint hit");
    try {
        const email = req.body.email;
        const authRes = await Auth.logout(email);
        res.status(200).json(authRes);
    } catch (e) {
        res.status(500).json({ status: "failed", message: e });
    }
});

// authenticated routes
async function AuthenticateStaff(
    req: Response | any,
    res: Response,
    next: NextFunction
) {
    console.log("attempt to authenticate staff");
    try {
        const token = req.headers["authorization"].split(" ")[1];
        const authRes = await Auth.verifyJwt(token);
        if (authRes.status === "ok") {
            req.email = authRes.decodedData.email;
            const userDoc = await MongooseDatabase.users.getUser(
                authRes.decodedData.email
            );
            if (userDoc.isStaff === true) {
                next();
            } else {
                res.status(400).json({
                    status: "failed",
                    message: "User is not authorized",
                });
            }
        } else {
            res.status(400).json({
                status: "failed",
                message: "user credentials don't check out",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: "something went wrong with verification",
        });
    }
}
async function AuthenticateStudent(
    req: Response | any,
    res: Response,
    next: NextFunction
) {
    console.log("attempt to authenticate student");
    try {
        const token = req.headers["authorization"].split(" ")[1];
        const authRes = await Auth.verifyJwt(token);
        if (authRes.status === "ok") {
            req.email = authRes.decodedData.email;
            const userDoc = await MongooseDatabase.users.getUser(
                authRes.decodedData.email
            );
            if (userDoc.isStaff === false) {
                next();
            } else {
                res.status(400).json({
                    status: "failed",
                    message: "User is not authorized",
                });
            }
        } else {
            res.status(400).json({
                status: "failed",
                message: "user credentials don't check out",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: "something went wrong with verification",
        });
    }
}
async function Authenticate(
    req: Response | any,
    res: Response,
    next: NextFunction
) {
    console.log("attempt to authenticate");
    try {
        const token = req.headers["authorization"].split(" ")[1];
        const authRes = await Auth.verifyJwt(token);
        if (authRes.status === "ok") {
            req.email = authRes.decodedData.email;
            next();
        } else {
            res.status(400).json({
                status: "failed",
                message: "user credentials don't check out",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: "something went wrong with verification",
        });
    }
}
// logout
expressApp.post(
    "/restrictedRoute",
    Authenticate,
    async (req: Request | any, res) => {
        console.log("restricted route hit");
        try {
            const userData = req.userData;
            res.status(200).json({
                status: "ok",
                message: `you are coming as ${req.email}`,
            });
        } catch (e) {
            res.status(500).json({ status: "failed", message: e });
        }
    }
);

// ---------------------------------- room stuff
expressApp.post(
    "/createRoom",
    AuthenticateStaff,
    async (req: Request | any, res) => {
        try {
            // get user data
            const getUser = await MongooseDatabase.users.getUser(req.email);
            // make sure is staff
            if (!getUser.isStaff) {
                throw "User is not authorized to do this action";
            }
            // get data from body
            const roomDetails: RoomData = {
                roomName: req.body.roomName,
                roomCapacity: req.body.roomCapacity,
                roomId: generateRandomString(10),
                isActive: false,
                pricePerHour: req.body.pricePerHour,
                promoCodes: req.body.promoCodes,
                earliestBookingTime: req.body.earliestBookingTime,
                latestBookingTime: req.body.latestBookingTime
            };
            const result = await MongooseDatabase.rooms.createRoom(roomDetails);
            res
                .status(200)
                .send({ status: "ok", message: `${roomDetails.roomName} created` });
        } catch (error) {
            res.status(500).send({ status: "failed", message: error });
        }
    }
);

expressApp.get(
    "/getAllRooms",
    Authenticate,
    async (req: Request | any, res) => {
        try {
            // get rooms
            const rooms = await MongooseDatabase.rooms.getAllRooms();
            res.status(200).json({ status: "ok", message: "got all rooms", rooms });
        } catch (error) {
            res.status(500).send({ status: "failed", message: error });
        }
    }
);
expressApp.get("/getRoom", Authenticate, async (req: Request | any, res) => {
    try {
        // get rooms
        const room = await MongooseDatabase.rooms.getRoom(req.body.roomId);
        res.status(200).json({ status: "ok", message: "got room", room });
    } catch (error) {
        res.status(500).send({ status: "failed", message: error });
    }
});
expressApp.delete(
    "/deleteRoom",
    AuthenticateStaff,
    async (req: Request | any, res) => {
        try {
            // get user data
            const getUser = await MongooseDatabase.users.getUser(req.email);
            // make sure is staff
            if (!getUser.isStaff) {
                throw "User is not authorized to do this action";
            }
            // get rooms
            const result = await MongooseDatabase.rooms.deleteRoom(req.body.roomId);
            res.status(200).json(result);
        } catch (error) {
            res
                .status(500)
                .send({ status: "failed", message: (error as Error).toString() });
        }
    }
);
expressApp.post(
    "/updateRoom",
    AuthenticateStaff,
    async (req: Request | any, res) => {
        try {
            // get user data
            const getUser = await MongooseDatabase.users.getUser(req.email);
            // make sure is staff
            if (!getUser.isStaff) {
                throw "User is not authorized to do this action";
            }
            // get rooms
            const roomId = req.body.roomId;
            const changes = req.body.changes;
            const result = await MongooseDatabase.rooms.updateRoom(roomId, changes);
            res.status(200).json(result);
        } catch (error) {
            res
                .status(500)
                .send({ status: "failed", message: (error as Error).toString() });
        }
    }
);
expressApp.post(
    "/createBooking",
    AuthenticateStudent,
    async (req: Request | any, res) => {
        try {
            // get user data
            const getUser = await MongooseDatabase.users.getUser(req.email);
            // make sure is student
            if (getUser.isStaff !== false) {
                throw "User is not authorized to do this action";
            }
            const result = await MongooseDatabase.bookings.createBookings(
                req.body.email,
                req.body.roomId,
                req.body.time,
                req.body.date
            );
            res
                .status(200)
                .send({ status: "ok", message: "booking was created", result });
        } catch (error) {
            res
                .status(500)
                .send({ status: "failed", message: (error as Error).toString() });
        }
    }
);
expressApp.post(
    "/getBookingsByRoomId",
    Authenticate,
    async (req: Request | any, res) => {
        try {
            const bookings = await MongooseDatabase.bookings.getBookingsByRoomId(
                req.body.roomId
            );
            res.status(200).send({ status: "ok", message: "got bookings", bookings });
        } catch (error) {
            res
                .status(500)
                .send({ status: "failed", message: (error as Error).toString() });
        }
    }
);
expressApp.post(
    "/getBookingsByUserEmail",
    Authenticate,
    async (req: Request | any, res) => {
        try {
            const bookings = await MongooseDatabase.bookings.getBookingsByUserEmail(
                req.body.email
            );
            res.status(200).send({ status: "ok", message: "got bookings", bookings });
        } catch (error) {
            res
                .status(500)
                .send({ status: "failed", message: (error as Error).toString() });
        }
    }
);
expressApp.delete(
    "/deleteBooking",
    AuthenticateStudent,
    async (req: Request | any, res) => {
        try {
            MongooseDatabase.bookings.deleteBooking(req.body.id);
            res.status(200).send({ status: "ok", message: "booking was deleted" });
        } catch (error) {
            res
                .status(500)
                .send({ status: "failed", message: (error as Error).toString() });
        }
    }
);
expressApp.post(
    "/updateBooking",
    AuthenticateStudent,
    async (req: Request | any, res) => {
        try {
            // get rooms
            const bookingId = req.body.id;
            const changes = req.body.changes;
            const result = await MongooseDatabase.bookings.updateBooking(
                bookingId,
                changes
            );
            res.status(200).json(result);
        } catch (error) {
            res
                .status(500)
                .send({ status: "failed", message: (error as Error).toString() });
        }
    }
);
export default expressApp;
