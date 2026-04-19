import { Router, type Request, type Response } from "express";

export const healthRouter: Router = Router();

healthRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version: process.env["npm_package_version"] ?? "0.0.0"
  });
});
