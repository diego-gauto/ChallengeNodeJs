import nodemailer from "nodemailer";
import { enviroment } from "../config/enviroment";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: enviroment.NM_USERNAME,
    pass: enviroment.NM_PASSWORD,
  },
});
