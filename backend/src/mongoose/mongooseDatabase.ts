import { UserDataModel } from "./mongooseSchemas";
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
}

export const MongooseDatabase = {
  users: {
    getUser: MongooseDB.getUser,
    saveNewUser: MongooseDB.saveNewUser,
  },
  rooms: {},
  bookings: {},
};
