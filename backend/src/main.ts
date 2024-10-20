console.clear()
import MongooseDB from "./mongoose/mongooseDatabase";
import expressApp from "./expressServer";
import { NewUserData, UserData } from "./mongoose/mongooseSchemas";

const execution = async () => {
    // start up db
    await MongooseDB.init()
    // testing
    const userData: UserData = {
        userName: "bert",
        email: "bert@gmail.com",
        hashedPassword: "password",
        isStaff: true,
        activeAccessToken: ""
    }
    await MongooseDB.saveNewUser(userData)
    // start up server
    const port = 3000
    expressApp.listen(port, () => {
        console.log(`Server started on port ${port}`)
    })
}
execution();
