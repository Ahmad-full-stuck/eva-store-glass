import { randomUUID } from "node:crypto";
import {
  seedCategories,
  seedGovernorates,
  seedProducts,
  seedRoutes,
  findCategory,
  findGovernorate,
} from "./catalog";
import { createOrderNumber } from "./order-number";
import { HttpError } from "./http";
import {
  ContactMessageSchema,
  OrderSchema,
  type Category,
  type ContactMessage,
  type Governorate,
  type Order,
  type OrderItem,
  type Product,
  type ProductQuery,
  type SiteRoute,
} from "./schemas";

const MAX_CONTACT_MESSAGES = 500;
const MAX_ORDERS = 1000;
const MAX_ORDER_QUANTITY = 250;
const MAX_ITEM_QUANTITY = 100;

export type StorageMode = "memory" | "database";

export type ValidatedOrderInput = {
  name: string;
  phone: string;
  governorate: string;
  district: string;
  address: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    color?: string;
  }>;
};

export type ProductListResult = {
  products: Product[];
};

export interface StoreRepository {
  readonly storage: StorageMode;
  isReady(): boolean;
  listProducts(filters: ProductQuery): Promise<ProductListResult>;
  getProduct(identifier: string): Promise<Product | undefined>;
  listCategories(): Promise<Category[]>;
  listGovernorates(): Promise<Governorate[]>;
  listRoutes(): Promise<SiteRoute[]>;
  createContact(input: {
    name: string;
    phone: string;
    message: string;
  }): Promise<ContactMessage>;
  createOrder(input: ValidatedOrderInput): Promise<Order>;
  getOrder(orderNumber: string): Promise<Order | undefined>;
}

const cloneProduct = (product: Product): Product => ({
  ...product,
  colors: [...product.colors],
});

const cloneCategory = (category: Category): Category => ({ ...category });

const cloneGovernorate = (governorate: Governorate): Governorate => ({
  ...governorate,
});

const cloneRoute = (route: SiteRoute): SiteRoute => ({ ...route });

const cloneOrder = (order: Order): Order => ({
  ...order,
  customer: { ...order.customer },
  items: order.items.map((item) => ({ ...item })),
});

const stockLabel = (
  quantity: number,
): Pick<Product, "inStock" | "stockStatus" | "stock"> => {
  if (quantity <= 0) {
    return { inStock: false, stockStatus: "out_of_stock", stock: "غير متوفر" };
  }
  if (quantity <= 5) {
    return { inStock: true, stockStatus: "low_stock", stock: "كمية محدودة" };
  }
  return { inStock: true, stockStatus: "in_stock", stock: "متوفر" };
};

const normalize = (value: string): string => value.trim().toLocaleLowerCase();

export class InMemoryStoreRepository implements StoreRepository {
  readonly storage: StorageMode = "memory";

  private readonly productsById = new Map<string, Product>();
  private readonly productsBySlug = new Map<string, Product>();
  private readonly categories: Category[];
  private readonly governorates: Governorate[];
  private readonly routes: SiteRoute[];
  private readonly orders = new Map<string, Order>();
  private readonly contactMessages = new Map<string, ContactMessage>();

  constructor(
    products: readonly Product[] = seedProducts,
    categories: readonly Category[] = seedCategories,
    governorates: readonly Governorate[] = seedGovernorates,
    routes: readonly SiteRoute[] = seedRoutes,
  ) {
    this.categories = categories.map(cloneCategory);
    this.governorates = governorates.map(cloneGovernorate);
    this.routes = routes.map(cloneRoute);
    for (const product of products) {
      const copy = cloneProduct(product);
      this.productsById.set(copy.id, copy);
      this.productsBySlug.set(copy.slug, copy);
    }
  }

  isReady(): boolean {
    return true;
  }

  async listProducts(filters: ProductQuery): Promise<ProductListResult> {
    const category = filters.category
      ? findCategory(filters.category, this.categories)
      : undefined;
    if (filters.category && !category) return { products: [] };
    const search = filters.search ? normalize(filters.search) : "";

    const products = [...this.productsById.values()].filter((product) => {
      if (category && product.categoryId !== category.id) return false;
      if (
        filters.inStock !== undefined &&
        product.inStock !== filters.inStock
      ) {
        return false;
      }
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }
      if (search) {
        const searchable = normalize(
          [
            product.name,
            product.slug,
            product.type,
            product.category,
            product.color,
            product.colors.join(" "),
            product.use,
            product.composition,
            product.finish,
            product.description,
          ].join(" "),
        );
        if (!searchable.includes(search)) return false;
      }
      return true;
    });

    switch (filters.sort) {
      case "price_asc":
      case "low":
        products.sort((left, right) => left.price - right.price);
        break;
      case "price_desc":
      case "high":
        products.sort((left, right) => right.price - left.price);
        break;
      case "newest":
        products.sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        );
        break;
      case "name":
        products.sort((left, right) =>
          left.name.localeCompare(right.name, "ar"),
        );
        break;
      case "featured":
        break;
    }

    return { products: products.map(cloneProduct) };
  }

  async getProduct(identifier: string): Promise<Product | undefined> {
    const normalized = identifier.trim();
    const product =
      this.productsById.get(normalized) ??
      this.productsBySlug.get(normalized) ??
      this.productsById.get(normalized.toLowerCase()) ??
      this.productsBySlug.get(normalized.toLowerCase());
    return product ? cloneProduct(product) : undefined;
  }

  async listCategories(): Promise<Category[]> {
    return this.categories.map(cloneCategory);
  }

  async listGovernorates(): Promise<Governorate[]> {
    return this.governorates.map(cloneGovernorate);
  }

  async listRoutes(): Promise<SiteRoute[]> {
    return this.routes.map(cloneRoute);
  }

  async createContact(input: {
    name: string;
    phone: string;
    message: string;
  }): Promise<ContactMessage> {
    if (this.contactMessages.size >= MAX_CONTACT_MESSAGES) {
      throw new HttpError(503, "SERVICE_BUSY", "تم تجاوز حد الرسائل المؤقت.");
    }
    const message = ContactMessageSchema.parse({
      id: `contact_${randomUUID()}`,
      name: input.name,
      phone: input.phone,
      message: input.message,
      status: "new",
      createdAt: new Date().toISOString(),
    });
    this.contactMessages.set(message.id, message);
    return { ...message };
  }

  async createOrder(input: ValidatedOrderInput): Promise<Order> {
    if (this.orders.size >= MAX_ORDERS) {
      throw new HttpError(503, "SERVICE_BUSY", "تم تجاوز حد الطلبات المؤقت.");
    }

    const normalizedItems = new Map<
      string,
      { product: Product; quantity: number; color: string }
    >();
    const quantitiesByProduct = new Map<string, number>();
    let totalQuantity = 0;

    for (const item of input.items) {
      if (item.quantity > MAX_ITEM_QUANTITY) {
        throw new HttpError(
          400,
          "INVALID_QUANTITY",
          "كمية أحد العناصر أكبر من الحد المسموح.",
        );
      }
      const product = this.findInternalProduct(item.productId);
      if (!product) {
        throw new HttpError(
          404,
          "PRODUCT_NOT_FOUND",
          "أحد المنتجات غير موجود.",
        );
      }
      const color = item.color ?? product.color;
      if (!product.colors.includes(color)) {
        throw new HttpError(
          422,
          "INVALID_COLOR",
          "اللون المطلوب غير متوفر لهذا المنتج.",
        );
      }
      const key = `${product.id}:${color}`;
      const existing = normalizedItems.get(key);
      const quantity = (existing?.quantity ?? 0) + item.quantity;
      if (quantity > MAX_ITEM_QUANTITY) {
        throw new HttpError(
          400,
          "INVALID_QUANTITY",
          "كمية أحد العناصر أكبر من الحد المسموح.",
        );
      }
      const productQuantity =
        (quantitiesByProduct.get(product.id) ?? 0) + item.quantity;
      if (productQuantity > product.stockQuantity) {
        throw new HttpError(
          409,
          "OUT_OF_STOCK",
          "الكمية المطلوبة غير متوفرة للمنتج.",
        );
      }
      quantitiesByProduct.set(product.id, productQuantity);
      totalQuantity += item.quantity;
      if (totalQuantity > MAX_ORDER_QUANTITY) {
        throw new HttpError(
          400,
          "INVALID_QUANTITY",
          "إجمالي كمية الطلب أكبر من الحد المسموح.",
        );
      }
      normalizedItems.set(key, { product, quantity, color });
    }

    const governorate = findGovernorate(input.governorate, this.governorates);
    if (!governorate) {
      throw new HttpError(422, "INVALID_GOVERNORATE", "المحافظة غير صالحة.");
    }

    const orderItems: OrderItem[] = [...normalizedItems.values()].map(
      ({ product, quantity, color }) => ({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        image: product.image,
        color,
        unitPrice: product.price,
        quantity,
        lineTotal: Math.round(product.price * quantity),
      }),
    );
    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const total = subtotal + governorate.deliveryFee;
    let orderNumber = createOrderNumber();
    while (this.orders.has(orderNumber)) orderNumber = createOrderNumber();
    const timestamp = new Date().toISOString();
    const order = OrderSchema.parse({
      id: `order_${randomUUID()}`,
      orderNumber,
      status: "pending",
      customer: { name: input.name, phone: input.phone },
      governorate: governorate.name,
      district: input.district,
      address: input.address,
      notes: input.notes,
      items: orderItems,
      subtotal,
      deliveryFee: governorate.deliveryFee,
      total,
      currency: "IQD",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    this.orders.set(order.orderNumber, order);
    for (const { product, quantity } of normalizedItems.values()) {
      product.stockQuantity -= quantity;
      Object.assign(product, stockLabel(product.stockQuantity));
      product.updatedAt = timestamp;
    }
    return cloneOrder(order);
  }

  async getOrder(orderNumber: string): Promise<Order | undefined> {
    const order = this.orders.get(orderNumber.trim().toUpperCase());
    return order ? cloneOrder(order) : undefined;
  }

  private findInternalProduct(identifier: string): Product | undefined {
    const normalized = identifier.trim();
    return (
      this.productsById.get(normalized) ??
      this.productsBySlug.get(normalized) ??
      this.productsById.get(normalized.toLowerCase()) ??
      this.productsBySlug.get(normalized.toLowerCase())
    );
  }
}

export function createStoreRepository(): StoreRepository {
  return new InMemoryStoreRepository();
}

export const storeRepository = createStoreRepository();
