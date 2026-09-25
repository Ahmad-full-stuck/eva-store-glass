import { HealthCheckResponse } from "@workspace/api-zod";
import type { Request, Response } from "express";
import {
  ContactRequestSchema,
  OrderNumberSchema,
  OrderRequestSchema,
  ProductIdentifierSchema,
  ProductQuerySchema,
} from "./lib/schemas";
import { storeRepository } from "./lib/repository";
import { HttpError } from "./lib/http";

const databaseConfigured = (): boolean =>
  Boolean(process.env.DATABASE_URL?.trim());

export async function healthController(
  _req: Request,
  res: Response,
): Promise<void> {
  const health = HealthCheckResponse.parse({ status: "ok" });
  res.json({
    ...health,
    ready: storeRepository.isReady(),
    storage: storeRepository.storage,
    databaseConfigured: databaseConfigured(),
    checkedAt: new Date().toISOString(),
  });
}

export async function readinessController(
  _req: Request,
  res: Response,
): Promise<void> {
  const ready = storeRepository.isReady();
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    ready,
    storage: storeRepository.storage,
    databaseConfigured: databaseConfigured(),
    checkedAt: new Date().toISOString(),
  });
}

export async function listProductsController(
  req: Request,
  res: Response,
): Promise<void> {
  const filters = ProductQuerySchema.parse(req.query);
  const result = await storeRepository.listProducts(filters);
  res.json({
    data: result.products,
    meta: { count: result.products.length },
  });
}

export async function getProductController(
  req: Request,
  res: Response,
): Promise<void> {
  const id = ProductIdentifierSchema.parse(req.params.id);
  const product = await storeRepository.getProduct(id);
  if (!product) {
    throw new HttpError(404, "PRODUCT_NOT_FOUND", "المنتج غير موجود.");
  }
  res.json({ data: product });
}

export async function listCategoriesController(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({ data: await storeRepository.listCategories() });
}

export async function listRoutesController(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({ data: await storeRepository.listRoutes() });
}

export async function listGovernoratesController(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({ data: await storeRepository.listGovernorates() });
}

export async function contactController(
  req: Request,
  res: Response,
): Promise<void> {
  const input = ContactRequestSchema.parse(req.body);
  const message = await storeRepository.createContact(input);
  res.status(201).json({ data: message });
}

export async function createOrderController(
  req: Request,
  res: Response,
): Promise<void> {
  const input = OrderRequestSchema.parse(req.body);
  const order = await storeRepository.createOrder(input);
  res.status(201).json({ data: order });
}

export async function getOrderController(
  req: Request,
  res: Response,
): Promise<void> {
  const orderNumber = OrderNumberSchema.parse(req.params.orderNumber);
  const order = await storeRepository.getOrder(orderNumber);
  if (!order) {
    throw new HttpError(404, "ORDER_NOT_FOUND", "الطلب غير موجود.");
  }
  res.json({ data: order });
}
