import { Db } from "mongodb";
import { addCoworkingSeats } from "./populatedb";
import express from "express";
import { book, character, characters, free, freeSeats } from "./resolvers";
import moment from "moment";

const run = async () => {
  const db: Db = await addCoworkingSeats();
  const app = express();
  app.set("db", db);


  app.get("/status", async (req, res) => {
    moment.locale('es');
    const Date = moment().format('l');;
    res.json({status:200,Date:Date});
  });

  app.get("/characters", characters);
  app.get("/character/:id", character);
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
