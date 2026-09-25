import { randomBytes } from "node:crypto";

export const ORDER_NUMBER_PATTERN = /^EVA-[A-F0-9]{24}$/;

export function createOrderNumber(): string {
  return `EVA-${randomBytes(12).toString("hex").toUpperCase()}`;
}
