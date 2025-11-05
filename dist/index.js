"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./tracing");
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = 3000;
let db;
app.get("/todo", async (_req, res) => {
    const todos = await db.collection("todos").find({}).toArray();
    res.send(todos);
});
app.get("/todo/:id", async (req, res) => {
    const todo = await db.collection("todos").findOne({ id: req.params.id });
    res.send(todo);
});
app.listen(port, async () => {
    const client = await mongodb_1.MongoClient.connect("mongodb://admin:secret123@localhost:27017");
    db = client.db("todo");
    db.collection("todos").insertMany([
        { id: "1", title: "Buy groceries" },
        { id: "2", title: "Install Aspecto" },
        { id: "3", title: "buy my own name domain" },
    ]);
    console.log(`Example app listening on port ${port}`);
});
