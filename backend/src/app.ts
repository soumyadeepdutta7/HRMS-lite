import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { json } from "body-parser";
import { employeeRouter } from "./routes/employees";
import { attendanceRouter } from "./routes/attendance";

dotenv.config();

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
    })
  );
  app.use(json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/employees", employeeRouter);
  app.use("/api/attendance", attendanceRouter);

  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error(err);
      const status = err.status || 500;
      res.status(status).json({
        message: err.message || "Internal server error",
        details: err.details || undefined,
      });
    }
  );

  return app;
};

