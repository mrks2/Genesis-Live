import express, { type Express } from "express";
import { healthRouter } from "../routes/health.js";
import { notFoundHandler } from "../middleware/notFoundHandler.js";
import { errorHandler } from "../middleware/errorHandler.js";

export function createHttpApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.use(healthRouter);

  app.get("/", (_req, res) => {
    res.json({
      message: "Genesis Live backend is alive.",
      docs: "https://github.com/mrks2/Genesis-Live"
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
