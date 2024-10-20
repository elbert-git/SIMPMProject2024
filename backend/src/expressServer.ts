import express, { NextFunction, Request, Response, response } from "express"
import Auth from "./auth"
import Database from "./database"

const expressApp = express()
expressApp.use(express.json())

// register
expressApp.post("/register", async (req, res) => {
    console.log("register endpoint hit", req.body)
    try {
        const userName = req.body.userName
        const password = req.body.password
        const isStaff = req.body.isStaff
        console.log(userName, password, isStaff)
        const registerRes = await Auth.register(userName, password, isStaff)
        res.status(200).json({ status: "ok", message: `userName: ${registerRes.userName} registered` })
    } catch (e) {
        console.log(e)
        res.status(500).json({ status: "failed", message: e })
    }
})
// tests
expressApp.get("/test_view", async (req, res) => {
    res.json(Database.users)
})

// login
expressApp.post("/login", async (req, res) => {
    console.log("login endpoint hit")
    try {
        const userName = req.body.userName
        const password = req.body.password
        const authRes = await Auth.login(userName, password)
        res.status(200).json({ status: "ok", ...authRes })
    } catch (e) {
        res.status(500).json({ status: "failed", message: e })
    }
})

// logout
expressApp.post("/logout", async (req, res) => {
    console.log("logout endpoint hit")
    try {
        const userName = req.body.userName
        const userData = await Database.getUser(userName)
        if (userData) {
            userData.activeKeys = ""
            res.status(200).json({ status: "ok", message: `${userName} logged out` })
        } else {
            res.status(500).json({ status: "failed", message: `${userName} doesn't exist` })
        }
    } catch (e) {
        res.status(500).json({ status: "failed", message: e })
    }
})



// authenticated routes
async function Authenticate(req: Response | any, res: Response, next: NextFunction) {
    console.log("attempt to authenticat")
    try {
        const token = req.headers['authorization'].split(" ")[1]
        const authRes = await Auth.verifyJwt(token)
        if (authRes.status === "ok") {
            req.userData = authRes.userData
            next()
        } else {
            res.status(400).json({ status: "failed", message: "user credentials don't chedck out" })
        }
    } catch (error) {
        res.status(500).json({ status: "failed", message: "something went wrong with verification" })
    }
}
// logout
expressApp.post("/restrictedRoute", Authenticate, async (req: Request | any, res) => {
    console.log("restricted route hit")
    try {
        const userData = req.userData
        res.status(200).json({ status: "ok", message: `you are coming as ${userData.userName}` })
    } catch (e) {
        res.status(500).json({ status: "failed", message: e })
    }
})


export default expressApp