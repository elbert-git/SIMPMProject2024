"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.clear();
console.log("=============================");
const mongooseDatabase_1 = __importDefault(require("./mongoose/mongooseDatabase"));
const expressServer_1 = __importDefault(require("./expressServer"));
const execution = () => __awaiter(void 0, void 0, void 0, function* () {
    // start up db
    yield mongooseDatabase_1.default.init();
    // start up server
    const port = 3000;
    expressServer_1.default.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
});
execution();
