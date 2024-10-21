import express, { NextFunction, Request, Response, response } from "express";
import Auth from "./auth";
import Database from "./database";
import { NewUserData } from "./mongoose/mongooseSchemas";
import { MongooseDatabase } from "./mongoose/mongooseDatabase";

const expressApp = express();
expressApp.use(express.json());

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
    res.status(200).json(authRes);
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
async function Authenticate(
  req: Response | any,
  res: Response,
  next: NextFunction
) {
  console.log("attempt to authenticat");
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
  Authenticate,
  async (req: Request | any, res) => {
    try {
      // get user data
      const getUser = await MongooseDatabase.users.getUser(req.email);
      // get data from body
      const roomDetails = {};
    } catch (error) {
      res.status(500).send({ status: "failed", message: error });
    }
  }
);

export default expressApp;
