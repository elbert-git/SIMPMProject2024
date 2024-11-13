import mongoose from "mongoose";

// interfaces
export interface UserData {
    email: string;
    userName: string;
    isStaff: Boolean;
    hashedPassword: string;
    activeAccessToken: string;
}
export interface NewUserData {
    email: string;
    userName: string;
    isStaff: Boolean;
    password: string;
}

export interface RoomData {
    roomId: string;
    roomName: string;
    isActive: boolean;
    pricePerHour: Number;
    roomCapacity: Number;
    latestBookingTime: Number;
    earliestBookingTime: Number;
    promoCodes: { [index: string]: number };
}

export interface BookingData {
    bookerUserName: string;
    bookerEmail: string;
    roomId: string;
    time: number;
    date: string
}

// schemas
const userDataSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        userName: { type: String, required: true },
        isStaff: { type: Boolean, required: true },
        hashedPassword: { type: String, required: true },
        activeAccessToken: String,
    },
    { minimize: false }
);

const BookingDataSchema = new mongoose.Schema(
    {
        bookerUserName: { type: String, required: true },
        bookerEmail: { type: String, required: true },
        roomId: { type: String, required: true },
        time: { type: Number, required: true },
        date: { type: String, required: true }  // yyyy/mm/dd
    },
    { minimize: false }
);

const roomDataSchema = new mongoose.Schema(
    {
        roomId: { type: String, required: true, unique: true },
        roomName: { type: String, required: true },
        isActive: { type: Boolean, required: true },
        pricePerHour: { type: Number, required: true },
        roomCapacity: { type: String, required: true },
        promoCodes: { type: Object, required: true },
        earliestBookingTime: { type: Number, required: true },
        latestBookingTime: { type: Number, required: true },
    },
    { minimize: false }
);

// models
export const UserDataModel = mongoose.model<UserData>(
    "UserData",
    userDataSchema
);

export const RoomDataModel = mongoose.model<RoomData>(
    "RoomData",
    roomDataSchema
);

export const BookingDataModel = mongoose.model<RoomData>(
    "bookingData",
    BookingDataSchema
);
