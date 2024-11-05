import bcrypt from "bcrypt";
import Database from "./database";
import jwt from "jsonwebtoken";
import MongooseDB from "./mongoose/mongooseDatabase";
import { NewUserData, UserData } from "./mongoose/mongooseSchemas";
import constants from "./constants";
import { StatusMessage } from "./utilities";

const jwtSecret = constants.jwt_secret as jwt.Secret;

export interface TokenCredentials {
    email: string;
    isStaff: string;
}

export default class Auth {
    static async register(newUserData: NewUserData) {
        // check if user exist
        const getUser = await MongooseDB.getUser(newUserData.email);
        if (getUser) {
            throw "user with email is taken";
        }
        // create hashed password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newUserData.password, salt);
        // save to database
        const userData: UserData = {
            userName: newUserData.userName,
            hashedPassword,
            isStaff: newUserData.isStaff,
            email: newUserData.email,
            activeAccessToken: "",
        };
        MongooseDB.saveNewUser(userData);
        return userData;
    }
    static async login(credentials: {
        email: string;
        password: string;
    }): Promise<StatusMessage> {
        // check if user name exists
        const getUser = await MongooseDB.getUser(credentials.email);
        if (!getUser) {
            throw "email doesn't exist";
        }
        // match passwords
        const match = await bcrypt.compare(
            credentials.password,
            getUser.hashedPassword
        );
        // if match create keys
        if (match) {
            // create token
            const accessToken = jwt.sign({ email: credentials.email }, jwtSecret);
            // save active token
            getUser.activeAccessToken = accessToken;
            await getUser.save();
            // return token
            return {
                status: "ok",
                message: `${credentials.email} is logged in`,
                credentials: getUser,
                accessToken: accessToken,
            };
        }
        // else return error
        else {
            throw "credentials dont check out";
        }
    }
    static async logout(email: string): Promise<StatusMessage> {
        // check if user name exists
        const getUser = await MongooseDB.getUser(email);
        if (!getUser) {
            throw "username with email doesn't exist";
        }
        // remove user active key
        getUser.activeAccessToken = "";
        await getUser.save();
        //return status
        return {
            status: "ok",
            message: `user with email ${email} has been logged out`,
        };
    }
    static async verifyJwt(token: string): Promise<StatusMessage> {
        // attempt to decode
        const decodedData = Auth.decodeJwt(token);
        if (decodedData) {
            // check if key is active
            const getUser = await MongooseDB.getUser(decodedData.email);
            const match = getUser.activeAccessToken === token;
            if (match) {
                return { status: "ok", message: "verified successfully", decodedData };
            } else {
                // token is inactive therefor suspicious
                console.log("inactive token used, revoking access");
                //revoke current active token
                getUser.activeAccessToken = "";
                await getUser.save();
                //return
                return { status: "failed", message: "token expired" };
            }
        } else {
            // could not decode
            return { status: "failed", message: "failed to verify" };
        }
    }
    static decodeJwt(token: string) {
        let result: any = null;
        jwt.verify(token, jwtSecret, (err, data) => {
            if (err) {
                result = null;
            } else {
                result = data;
            }
        });
        return result as any;
    }
}
