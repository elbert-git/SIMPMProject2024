console.clear();
console.log("=============================");
import MongooseDB from "./mongoose/mongooseDatabase";
import expressApp from "./expressServer";

const execution = async () => {
  // start up db
  await MongooseDB.init();
  // start up server
  const port = 3000;
  expressApp.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
};
execution();
