import { randomUUID } from "node:crypto";
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { logger } from "./logger";

export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}

export const requestIdMiddleware: RequestHandler = (_req, res, next) => {
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new HttpError(
      404,
      "NOT_FOUND",
      `Route ${req.method} ${req.path} not found`,
    ),
  );
};

type Issue = {
  path?: unknown;
  message?: unknown;
  code?: unknown;
};

type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isZodLikeError = (value: unknown): value is { issues: Issue[] } =>
  isRecord(value) && Array.isArray(value.issues);

const isBodyParserError = (value: unknown): boolean =>
  isRecord(value) &&
  (value.type === "entity.parse.failed" ||
    value.type === "entity.too.large" ||
    value.type === "charset.unsupported" ||
    value.type === "encoding.unsupported");

const safeIssues = (issues: Issue[]): unknown[] =>
  issues.slice(0, 20).map((issue) => ({
    path: Array.isArray(issue.path) ? issue.path.slice(0, 10) : [],
    message:
      typeof issue.message === "string" ? issue.message : "Invalid value",
    code: typeof issue.code === "string" ? issue.code : "invalid",
  }));

const requestIdFrom = (res: Response): string | undefined => {
  const value = res.locals.requestId;
  return typeof value === "string" ? value : undefined;
};

const errorBody = (
  code: string,
  message: string,
  details: unknown,
  requestId: string | undefined,
): ApiErrorBody => {
  const body: ApiErrorBody = { error: { code, message } };
  if (details !== undefined) body.error.details = details;
  if (requestId) body.requestId = requestId;
  return body;
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const requestId = requestIdFrom(res);
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "حدث خطأ غير متوقع.";
  let details: unknown;

  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (isZodLikeError(error)) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "البيانات المدخلة غير صالحة.";
    details = { issues: safeIssues(error.issues) };
  } else if (isBodyParserError(error)) {
    statusCode = error.type === "entity.too.large" ? 413 : 400;
    code = statusCode === 413 ? "PAYLOAD_TOO_LARGE" : "INVALID_JSON";
    message =
      statusCode === 413 ? "حجم الطلب كبير جدًا." : "صيغة JSON غير صالحة.";
  }

  logger.error(
    {
      requestId,
      code,
      method: _req.method,
      path: _req.path,
      statusCode,
    },
    "Request failed",
  );

  res.status(statusCode).json(errorBody(code, message, details, requestId));
};
