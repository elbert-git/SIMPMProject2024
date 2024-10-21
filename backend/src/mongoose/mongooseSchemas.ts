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
  // dateTime: Date
  roomCapacity: Number;
  promoCodes: { [index: string]: number };
}

export interface BookingData {
  roomId: string;
  roomName: string;
  isActive: boolean;
  pricePerHour: Number;
  // dateTime: Date
  roomCapacity: Number;
  promoCodes: { [index: string]: number };
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

const roomDataSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    roomName: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    pricePerHour: { type: Number, required: true },
    roomCapacity: { type: String, required: true },
    promoCodes: { type: Object, required: true },
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
