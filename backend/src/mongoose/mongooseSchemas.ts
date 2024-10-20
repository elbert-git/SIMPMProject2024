import mongoose from "mongoose";

export interface UserData {
    email: string,
    userName: string,
    isStaff: Boolean,
    hashedPassword: string,
    activeAccessToken: string
}
export interface NewUserData {
    email: string,
    userName: string,
    isStaff: Boolean,
    password: string,
}

const userDataSchema = new mongoose.Schema({
    email: { type: String, required: true },
    userName: { type: String, required: true },
    isStaff: { type: Boolean, required: true },
    hashedPassword: { type: String, required: true },
    activeAccessToken: String,
})

export const UserDataModel = mongoose.model<UserData>('UserData', userDataSchema)
