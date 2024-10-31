// config.ts
import * as dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT || 3001;
export const baseUrl = process.env.BASE_URL || "default_url";
export const boxCount = 6;
