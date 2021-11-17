import { Request, Response } from "express";
import { Collection, Db } from "mongodb";
import { v4 as uuidv4 } from 'uuid';
import { setFlagsFromString } from "v8";

const checkDate = (day:string,month:string,year:string) =>{
  const date = new Date(parseInt(day),parseInt(month),parseInt(year));
  return date.toString() !== "Invalid Date";
}

export const freeSeats = async (req: Request, res: Response) => {
  if(req.query.day && req.query.month && req.query.year){
    const {day,month,year} = req.query as{
      day: string,
      month: string,
      year: string
    }
    if(checkDate(day,month,year)){
      const db: Db = req.app.get("db");
      const collection:Collection=db.collection("reservedSeats");
      let puesto = 1;
      let puestos_libres : Array<number> = new Array<number>();
      const seats = await collection.find({day:day,month:month,year:year}).toArray();
      while(puesto<=20){
        if(!seats.find((reservation)=>{return reservation.seat === puesto;})){
          puestos_libres.push(puesto);
        }
        puesto++;
      }
      res.status(200).json({Free_Seats: puestos_libres});
    }else{
      res.status(500).send("Invalid Date.");
    }
  }else{
    res.status(500).send("Missing Params.");
  }
};

export const book = async (req: Request, res: Response) => {
  if(req.query.day && req.query.month && req.query.year && req.query.seatNumber){
    const {day,month,year} = req.query as{
      day: string,
      month: string,
      year: string
    }
    if(checkDate(day,month,year)){
      const db: Db = req.app.get("db");
      const collection:Collection = db.collection("reservedSeats")
      const seatNumber = req.query.seatNumber
      const seat = await db.collection("reservedSeats").findOne({day:day,month:month,year:year,seat:seatNumber})
      if(seat){
        res.status(404).send("The seat is already reserved.");
      }else{
        const token = uuidv4();
        await db.collection("reservedSeats").insertOne({day:day,month:month,year:year,seat:seatNumber,token:token})
        res.status(200).json({token:token})
      }
    }else{
      res.status(500).send("Invalid Date.");
    }
  }else{
    res.status(500).send("Missing Params.");
  }
};

export const free = async (req: Request, res: Response) => {
  if(req.query.day && req.query.month && req.query.year && req.headers.token){
    const {day,month,year} = req.query as{
      day: string,
      month: string,
      year: string
    }
    if(checkDate(day,month,year)){
      const token = req.headers.token;
      const db: Db = req.app.get("db");
      const character = await db.collection("reservedSeats").findOne({day:day,month:month,year:year,token:token})
      if(character){
        await db.collection("reservedSeats").findOneAndDelete({day:day,month:month,year:year,token:token})
        res.status(200).send("Seat is now free.");
      }else{
        res.status(404).send("Seat is not reserved.");
      }
    }else{
      res.status(500).send("Invalid Date.");
    }
  }else{
    res.status(500).send("Missing Params or headers.");
  }
};



