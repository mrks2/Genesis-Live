import type { ErrorRequestHandler } from "express";
import { logger } from "../logger/index.js";

type HttpError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
};

export const errorHandler: ErrorRequestHandler = (err: HttpError, req, res, _next) => {
  const status = err.status ?? err.statusCode ?? 500;
  const isClientError = status >= 400 && status < 500;

  if (isClientError) {
    logger.warn(
      { err: err.message, status, path: req.originalUrl },
      "client error"
    );
    res.status(status).json({
      error: err.type ?? "bad_request",
      message: err.message
    });
    return;
  }

  logger.error(
    { err: err.message, stack: err.stack, path: req.originalUrl },
    "unhandled error"
  );
  res.status(500).json({
    error: "internal_error",
    message: "An unexpected error occurred."
  });
};
