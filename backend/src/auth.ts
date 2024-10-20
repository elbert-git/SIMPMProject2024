import bcrypt from 'bcrypt';
import Database from "./database";
import jwt from "jsonwebtoken";
import MongooseDB from './mongoose/mongooseDatabase';
import { NewUserData, UserData } from './mongoose/mongooseSchemas';
import constants from './constants';

const jwtSecret = constants.jwt_secret as jwt.Secret

export default class Auth {
    static async register(newUserData: NewUserData) {
        // check if user exist
        const getUser = await MongooseDB.getUser(newUserData.email);
        if (getUser) { throw "user with email is taken" }
        // create hashed password
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(newUserData.password, salt)
        // save to database
        const userData: UserData = {
            userName: newUserData.userName,
            hashedPassword,
            isStaff: newUserData.isStaff,
            email: newUserData.email,
            activeAccessToken: ""
        }
        MongooseDB.saveNewUser(userData)
        return userData
    }
    static async login(email: string, password: string) {
        // check if user name exists
        const getUser = await MongooseDB.getUser(email);
        if (!getUser) { throw "username doesn't exist"; }
        // match passwords
        const match = await bcrypt.compare(password, getUser.hashedPassword)
        // if match create keys 
        if (match) {
            // create token
            const accessToken = jwt.sign({ email }, jwtSecret, { expiresIn: "10m" })
            // save active token
            getUser.activeAccessToken = accessToken
            await getUser.save()
            // return token 
            return accessToken
        }
        // else return error
        else {
            throw "credentials dont check out"
        }
    }
    static async verifyJwt(token: string) {
        const result: { status: string, userData: any } = { status: "", userData: null }
        jwt.verify(token, jwtSecret, (err, data) => {
            if (err) { result.status = "ok"; }
            else { result.status = "ok"; result.userData = data }
        })
        return result
    }
}