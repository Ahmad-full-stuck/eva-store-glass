import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productStatusEnum = pgEnum("product_status", [
  "active",
  "draft",
  "archived",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "new",
  "read",
  "archived",
]);

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),
    index("categories_name_index").on(table.name),
  ],
);

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: text("type").notNull(),
    price: numeric("price", { precision: 12, scale: 0 }).notNull(),
    currency: text("currency").notNull().default("IQD"),
    unit: text("unit").notNull().default("m"),
    image: text("image").notNull(),
    color: text("color").notNull(),
    width: text("width").notNull(),
    composition: text("composition").notNull(),
    stretch: text("stretch").notNull(),
    weight: text("weight").notNull(),
    finish: text("finish").notNull(),
    use: text("use").notNull(),
    description: text("description").notNull().default(""),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    status: productStatusEnum("status").notNull().default("active"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_category_id_index").on(table.categoryId),
    index("products_status_index").on(table.status),
    index("products_price_index").on(table.price),
    index("products_stock_index").on(table.stockQuantity),
  ],
);

export const productColors = pgTable(
  "product_colors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    hex: text("hex").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("product_colors_product_name_unique").on(
      table.productId,
      table.name,
    ),
    uniqueIndex("product_colors_product_order_unique").on(
      table.productId,
      table.sortOrder,
    ),
    index("product_colors_product_id_index").on(table.productId),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull(),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    governorate: text("governorate").notNull(),
    district: text("district").notNull().default(""),
    address: text("address").notNull(),
    notes: text("notes"),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotal: numeric("subtotal", { precision: 12, scale: 0 }).notNull(),
    deliveryFee: numeric("delivery_fee", { precision: 12, scale: 0 })
      .notNull()
      .default("0"),
    total: numeric("total", { precision: 12, scale: 0 }).notNull(),
    currency: text("currency").notNull().default("IQD"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("orders_order_number_unique").on(table.orderNumber),
    index("orders_status_index").on(table.status),
    index("orders_created_at_index").on(table.createdAt),
    index("orders_phone_index").on(table.phone),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    image: text("image").notNull(),
    color: text("color").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 0 }).notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
    lineTotal: numeric("line_total", { precision: 12, scale: 0 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("order_items_order_id_index").on(table.orderId),
    index("order_items_product_id_index").on(table.productId),
  ],
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    message: text("message").notNull(),
    status: contactMessageStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("contact_messages_status_index").on(table.status),
    index("contact_messages_created_at_index").on(table.createdAt),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  colors: many(productColors),
  orderItems: many(orderItems),
}));

export const productColorsRelations = relations(productColors, ({ one }) => ({
  product: one(products, {
    fields: [productColors.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const contactMessagesRelations = relations(contactMessages, () => ({}));

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertProductColorSchema = createInsertSchema(productColors);
export const selectProductColorSchema = createSelectSchema(productColors);
export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);
export const insertContactMessageSchema = createInsertSchema(contactMessages);
export const selectContactMessageSchema = createSelectSchema(contactMessages);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductColor = typeof productColors.$inferSelect;
export type NewProductColor = typeof productColors.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
export type CategoryInsert = z.infer<typeof insertCategorySchema>;
export type ProductInsert = z.infer<typeof insertProductSchema>;
export type ProductColorInsert = z.infer<typeof insertProductColorSchema>;
export type OrderInsert = z.infer<typeof insertOrderSchema>;
export type OrderItemInsert = z.infer<typeof insertOrderItemSchema>;
export type ContactMessageInsert = z.infer<typeof insertContactMessageSchema>;
