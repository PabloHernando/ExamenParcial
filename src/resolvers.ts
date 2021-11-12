import { Request, Response } from "express";
import { Db } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

export const characters = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const db: Db = req.app.get("db");
  const chars = await db
    .collection("Characters")
    .find()
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .toArray();
  res.status(200).json(chars);
};

export const character = async (req: Request, res: Response) => {
  const id = req.params.id;
  const db: Db = req.app.get("db");
  const char = await db.collection("Characters").findOne({ id: parseInt(id) });
  if (char) res.status(200).json(char);
  else res.status(404).json({status:404,message:"Character not found."})
};

export const freeSeats = async (req: Request, res: Response) => {
  if(req.query.day && req.query.month && req.query.year){
    const day = parseInt(req.query.day as string);
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);
    if(month>1 && month<13 && year>2000 && day>1 && day<31){
      const db: Db = req.app.get("db");
      let puesto = 1;
      let puestos_libres : Array<number> = new Array<number>();
      while(puesto<=20){
        const character = await db.collection("reservedSeats").findOne({day:day,month:month,year:year,seat:puesto})
        if(!character){
          puestos_libres.push(puesto);
        }
        puesto++;
      }
      res.json({status:200,Puestos_Libres: puestos_libres});
    }else{
      res.json({status:500});
    }
  }else{
    res.json({status:500});
  }
};

export const book = async (req: Request, res: Response) => {
  if(req.query.day && req.query.month && req.query.year && req.query.seat){
    const day = parseInt(req.query.day as string);
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);
    const seat = parseInt(req.query.seat as string);
    if(month>1 && month<13 && year>0 && day>1 && day<31 && seat>0 && seat<21){
      const db: Db = req.app.get("db");
      const character = await db.collection("reservedSeats").findOne({day:day,month:month,year:year,seat:seat})
      if(character){
        res.json({status:404});
      }else{
        const token = uuidv4();
        await db.collection("reservedSeats").insertOne({day:day,month:month,year:year,seat:seat,token:token})
        res.json({status:200,token:token})
      }
    }else{
      res.json({status:500});
    }
  }else{
    res.json({status:500});
  }
};

export const free = async (req: Request, res: Response) => {
  if(req.headers.token && req.query.day && req.query.month && req.query.year){
    const day = parseInt(req.query.day as string);
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);
    if(month>1 && month<13 && year>0 && day>1 && day<31){
      const token = req.headers.token;
      const db: Db = req.app.get("db");
      const character = await db.collection("reservedSeats").findOne({token:token})
      if(character){
        await db.collection("reservedSeats").findOneAndDelete({token:token})
        res.json({status:200});
      }else{
        res.json({status:404})
      }
    }else{
      res.json({status:500});
    }
  }else{
    res.json({status:500});
  }
};



