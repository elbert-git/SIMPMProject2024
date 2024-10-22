import {
  RoomData,
  RoomDataModel,
  UserDataModel,
  BookingDataModel,
  BookingData,
} from "./mongooseSchemas";
import mongoose, { mongo } from "mongoose";
import constants from "../constants";
import { StatusMessage } from "../utilities";
import { UserData } from "./mongooseSchemas";

export default class MongooseDB {
  static url = `mongodb+srv://elbertnathanaeltkg:${constants.mongoose_password}@cluster0.lahxp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  static async init() {
    await mongoose.connect(MongooseDB.url);
    console.log("connected to mongoose");
  }
  static async getUser(email: string) {
    const user = await UserDataModel.find({ email });
    return user[0];
  }
  static async saveNewUser(userData: UserData): Promise<StatusMessage> {
    try {
      //  verify unique user
      const getUser = await MongooseDB.getUser(userData.email);
      if (getUser !== undefined) {
        throw "user with email already exists";
      }
      // create new document
      const userDoc = new UserDataModel({
        ...userData,
      });
      // save
      userDoc.save();
      // return status
      return { status: "ok", message: `new user ${userData.userName} created` };
    } catch (e) {
      return { status: "failed", message: e };
    }
  }
  static async getRoom(roomId: string) {
    const room = await RoomDataModel.find({ roomId });
    return room[0];
  }
  static async getAllRooms() {
    const rooms = await RoomDataModel.find({});
    return rooms;
  }
  static async createRoom(roomData: RoomData): Promise<StatusMessage> {
    const roomDoc = new RoomDataModel(roomData);
    await roomDoc.save();
    return {
      status: "ok",
      message: `${roomData.roomName} has been created`,
      roomData,
    };
  }
  static async deleteRoom(roomId: string): Promise<StatusMessage> {
    const room = await MongooseDB.getRoom(roomId);
    if (!room) {
      throw "room doesn't exist";
    }
    await RoomDataModel.findOneAndDelete({ roomId });
    return {
      status: "ok",
      message: `${room.roomName} has been deleted`,
    };
  }
  static async updateRoom(
    roomId: string,
    changes: RoomData | any
  ): Promise<StatusMessage> {
    // get room
    const room: RoomData | any = await MongooseDB.getRoom(roomId);
    if (!room) {
      throw "room doesnt exist";
    }
    // update all relevant keys
    const keys = Object.keys(changes);
    keys.forEach((key) => {
      room[key] = changes[key];
    });
    await room.save();
    // return status
    return { status: "ok", message: `${room.roomName} was updated` };
  }

  static async createBooking(
    email: string,
    roomId: string,
    time: number
  ): Promise<StatusMessage> {
    // get user
    const user = await MongooseDB.getUser(email);
    console.log(user);
    if (!user) {
      throw `user with email ${email} not done`;
    }
    //get room
    const room = await MongooseDB.getRoom(roomId);
    console.log(room);
    if (!user) {
      throw `room with id ${roomId} not done`;
    }
    // check for booking collisions
    const booking = await BookingDataModel.find({ time, roomId });
    if (booking.length > 0) {
      console.log("booking", booking);
      throw "Room is not available at the requested time";
    }
    // create booking
    const newBookingDetails: BookingData = {
      bookerEmail: user.email,
      bookerUserName: user.userName,
      time: time,
      roomId: room.roomId,
    };
    const newDoc = new BookingDataModel(newBookingDetails);
    await newDoc.save();
    return {
      status: "ok",
      message: `${user.userName} has booked ${room.roomName} at ${time}`,
      newDoc,
    };
  }
  static async getBookingsByUserEmail(email: string) {
    return await BookingDataModel.find({ bookerEmail: email });
  }
  static async getBookingsByRoomId(roomId: string) {
    return await BookingDataModel.find({ roomId });
  }
  static async deleteBooking(id: string): Promise<StatusMessage> {
    await BookingDataModel.findByIdAndDelete(id);
    return { status: "ok", message: "booking deleted" };
  }
  static async updateBooking(
    bookingId: string,
    changes: BookingData | any
  ): Promise<StatusMessage> {
    // get room
    const booking: BookingData | any = await BookingDataModel.findById(
      bookingId
    );
    if (!booking) {
      throw "room doesnt exist";
    }
    // update all relevant keys
    const keys = Object.keys(changes);
    keys.forEach((key) => {
      booking[key] = changes[key];
    });
    await booking.save();
    // return status
    return { status: "ok", message: `booking was updated` };
  }
}

export const MongooseDatabase = {
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
  bookings: {
    createBookings: MongooseDB.createBooking,
    getBookingsByUserEmail: MongooseDB.getBookingsByUserEmail,
    getBookingsByRoomId: MongooseDB.getBookingsByRoomId,
    deleteBooking: MongooseDB.deleteBooking,
    updateBooking: MongooseDB.updateBooking,
  },
};
