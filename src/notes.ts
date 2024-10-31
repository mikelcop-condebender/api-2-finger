// notes.ts

import { Request, Response, Router } from "express";
import connection from "./database"; // Ensure the correct import for your DB connection

const router = Router();

// Notes fetching endpoint
router.get("/notes", async (req: Request, res: Response) => {
  try {
    const [notes] = await connection.query("SELECT * FROM notes");
    res.status(200).json(notes);
    console.log(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).send("Error fetching notes");
  }
});

export default router;
