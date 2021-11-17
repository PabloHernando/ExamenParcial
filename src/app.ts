import { Db } from "mongodb";
import { addCoworkingSeats } from "./populatedb";
import express from "express";
import { book, free, freeSeats } from "./resolvers";
import moment from "moment";

const run = async () => {
  const db: Db = await addCoworkingSeats();
  const app = express();
  app.set("db", db);


  app.get("/status", async (req, res) => {
    const date = new Date();
    res.status(200).send(`${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`);
  });

  app.get("/freeSeats", freeSeats);
  app.post("/book", book);
  app.post("/free", free);

  await app.listen(3000);
};

try {
  run();
} catch (e) {
  console.error(e);
}


