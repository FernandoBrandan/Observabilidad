import "./tracing";
import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import logger from "./logger";

const app = express();
app.use(express.json());
const port = 3001;
let db: any;

app.get("/ping", (req, res) => {
  logger.info("Received ping request");
  res.send("pong");
});

app.get("/api/health", async (req, res) => {
  logger.info("Health check received", { body: req.body });
  res.status(201).send({ status: "ok" });
})

app.get("/todo", async (_req, res) => {
  const todos = await db.collection("todos").find({}).toArray();
  res.send(todos);
});

app.get("/todo/:id", async (req, res) => {
  const todo = await db.collection("todos").findOne({ id: req.params.id });
  res.send(todo);
});

app.listen(port, async () => {
  // const client = await MongoClient.connect("mongodb://admin:secret123@localhost:27017/?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin&appName=mongosh+2.5.8");
  // db = client.db("todo");
  // db.collection("todos").insertMany([
  //   { id: "1", title: "Buy groceries" },
  //   { id: "2", title: "Install Aspecto" },
  //   { id: "3", title: "buy my own name domain" },
  // ]);

  console.log(`Example app listening on port ${port}`);
});
