import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { errorHandler, notFoundHandler, requestIdMiddleware } from "./lib/http";

const app: Express = express();

const allowedOrigins = new Set(
  (
    process.env.CORS_ORIGINS ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "http://localhost:5173,http://127.0.0.1:5173")
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const allowAllOrigins = allowedOrigins.has("*");

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowAllOrigins || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Accept", "Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
  maxAge: 600,
};

app.disable("x-powered-by");
app.use(requestIdMiddleware);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "64kb", strict: true }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));

app.use("/api", router);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
