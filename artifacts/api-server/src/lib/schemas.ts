import { z } from "zod";

export const GOVERNORATE_IDS = [
  "baghdad",
  "basra",
  "nineveh",
  "erbil",
  "sulaymaniyah",
  "kirkuk",
  "anbar",
  "babil",
  "karbala",
  "najaf",
  "wasit",
  "maysan",
  "dhi-qar",
  "muthanna",
  "diwaniyah",
  "duhok",
  "halabja",
  "saladin",
] as const;

export type GovernorateId = (typeof GOVERNORATE_IDS)[number];

export const GOVERNORATES = [
  { id: "baghdad", name: "بغداد", deliveryFee: 2500 },
  { id: "basra", name: "البصرة", deliveryFee: 5000 },
  { id: "nineveh", name: "نينوى", deliveryFee: 5000 },
  { id: "erbil", name: "أربيل", deliveryFee: 4500 },
  { id: "sulaymaniyah", name: "السليمانية", deliveryFee: 4500 },
  { id: "kirkuk", name: "كركوك", deliveryFee: 4000 },
  { id: "anbar", name: "الانبار", deliveryFee: 4000 },
  { id: "babil", name: "بابل", deliveryFee: 3500 },
  { id: "karbala", name: "كربلاء", deliveryFee: 3000 },
  { id: "najaf", name: "النجف", deliveryFee: 3500 },
  { id: "wasit", name: "واسط", deliveryFee: 3500 },
  { id: "maysan", name: "ميسان", deliveryFee: 5000 },
  { id: "dhi-qar", name: "ذي قار", deliveryFee: 4500 },
  { id: "muthanna", name: "المثنى", deliveryFee: 5000 },
  { id: "diwaniyah", name: "الديوانية", deliveryFee: 3500 },
  { id: "duhok", name: "دهوك", deliveryFee: 4500 },
  { id: "halabja", name: "حلبجة", deliveryFee: 5000 },
  { id: "saladin", name: "صلاح الدين", deliveryFee: 4000 },
] as const;

export const SITE_ROUTES = [
  { id: "home", label: "الرئيسية", path: "/", header: true },
  { id: "catalog", label: "الأقمشة", path: "/catalog", header: true },
  {
    id: "new",
    label: "وصل حديثاً",
    path: "/catalog?sort=newest",
    header: false,
  },
  { id: "favorites", label: "المفضلة", path: "/favorites", header: false },
  { id: "about", label: "من نحن", path: "/about", header: true },
  { id: "guide", label: "دليل الأقمشة", path: "/fabric-guide", header: true },
  { id: "contact", label: "تواصلي معنا", path: "/contact", header: false },
  {
    id: "tracking",
    label: "تتبع الطلب",
    path: "/order-tracking",
    header: false,
  },
  { id: "policies", label: "السياسات", path: "/policies", header: false },
] as const;

export const CATEGORY_IDS = [
  "embroidered",
  "solid",
  "spandex",
  "sequin",
  "twill",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORIES = [
  {
    id: "embroidered",
    slug: "embroidered",
    name: "مطرز",
    description: "أقمشة فيها تطريز وتفاصيل مناسبة للمناسبات.",
  },
  {
    id: "solid",
    slug: "solid",
    name: "سادة",
    description: "أقمشة أساسية ناعمة أو ذات ملمس مميز.",
  },
  {
    id: "spandex",
    slug: "spandex",
    name: "سبانديكس",
    description: "أقمشة مرنة تناسب القطع التي تحتاج حركة وريحة.",
  },
  {
    id: "sequin",
    slug: "sequin",
    name: "ترتر ولمّاع",
    description: "أقمشة احتفالية بلمعان وترتر للتفاصيل.",
  },
  {
    id: "twill",
    slug: "twill",
    name: "تويل",
    description: "أقمشة تويل عملية للاستخدام اليومي.",
  },
] as const;

const firstQueryValue = (value: unknown): unknown =>
  Array.isArray(value) ? value[0] : value;

const queryText = (max: number) =>
  z.preprocess(firstQueryValue, z.string().trim().max(max).optional());

const queryNumber = (max: number) =>
  z.preprocess((value) => {
    const normalized = firstQueryValue(value);
    return normalized === "" ? undefined : normalized;
  }, z.coerce.number().finite().min(0).max(max).optional());

const queryBoolean = z.preprocess((value) => {
  const normalized = firstQueryValue(value);
  if (normalized === undefined || normalized === "") return undefined;
  if (normalized === true || normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === false || normalized === "false" || normalized === "0") {
    return false;
  }
  return normalized;
}, z.boolean().optional());

export const PRODUCT_SORT_OPTIONS = [
  "featured",
  "price_asc",
  "price_desc",
  "low",
  "high",
  "newest",
  "name",
] as const;

export const productSortSchema = z.enum(PRODUCT_SORT_OPTIONS);
export type ProductSort = z.infer<typeof productSortSchema>;

export const ProductQuerySchema = z
  .object({
    search: queryText(120),
    category: queryText(100),
    inStock: queryBoolean,
    minPrice: queryNumber(100_000_000),
    maxPrice: queryNumber(100_000_000),
    sort: z.preprocess(firstQueryValue, productSortSchema.default("featured")),
  })
  .superRefine((value, context) => {
    if (
      value.minPrice !== undefined &&
      value.maxPrice !== undefined &&
      value.minPrice > value.maxPrice
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxPrice"],
        message: "maxPrice must be greater than or equal to minPrice",
      });
    }
  });

export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export const ProductIdentifierSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Invalid product identifier");

const printableText = (value: string): boolean =>
  !/[\u0000-\u001f\u007f]/.test(value);

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must contain at least 2 characters")
  .max(120, "Name is too long")
  .refine(printableText, "Name contains invalid characters");

export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(24, "Phone number is too long")
  .regex(/^\+?[\d\s().-]+$/, "Phone number contains invalid characters")
  .transform((value) => value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, ""))
  .refine(
    (value) => /^\+?\d{10,15}$/.test(value),
    "Phone number must contain 10 to 15 digits",
  );

export const addressSchema = z
  .string()
  .trim()
  .min(5, "Address must contain at least 5 characters")
  .max(500, "Address is too long")
  .refine(printableText, "Address contains invalid characters");

export const districtSchema = z
  .string()
  .trim()
  .max(100, "District is too long")
  .refine(printableText, "District contains invalid characters")
  .default("");

export const notesSchema = z
  .string()
  .trim()
  .max(1000, "Notes are too long")
  .refine(printableText, "Notes contain invalid characters")
  .optional();

export const messageSchema = z
  .string()
  .trim()
  .min(10, "Message must contain at least 10 characters")
  .max(2000, "Message is too long")
  .refine(printableText, "Message contains invalid characters");

export const ContactRequestSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  message: messageSchema,
});

export type ContactRequest = z.infer<typeof ContactRequestSchema>;

const quantityInputSchema = z.coerce
  .number()
  .finite("Quantity must be a finite number")
  .min(0.5, "Quantity must be at least 0.5")
  .max(100, "Quantity cannot exceed 100");

export const OrderItemInputSchema = z
  .object({
    productId: ProductIdentifierSchema,
    quantity: quantityInputSchema.optional(),
    length: quantityInputSchema.optional(),
    color: z.string().trim().min(1).max(50).optional(),
    colorName: z.string().trim().min(1).max(50).optional(),
  })
  .superRefine((value, context) => {
    if (value.quantity === undefined && value.length === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "Quantity is required",
      });
    }
    if (
      value.quantity !== undefined &&
      value.length !== undefined &&
      value.quantity !== value.length
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "quantity and length must match",
      });
    }
  })
  .transform((value) => ({
    productId: value.productId,
    quantity: value.quantity ?? value.length ?? 0,
    color: value.color ?? value.colorName,
  }));

export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const OrderRequestSchema = z.preprocess(
  (value) => {
    if (!isRecord(value)) return value;
    const customer = isRecord(value.customer) ? value.customer : {};
    const shipping = isRecord(value.shippingAddress)
      ? value.shippingAddress
      : {};
    return {
      ...value,
      name: value.name ?? value.customerName ?? customer.name,
      phone: value.phone ?? customer.phone,
      governorate: value.governorate ?? shipping.governorate,
      district: value.district ?? shipping.district,
      address: value.address ?? shipping.address,
    };
  },
  z.object({
    name: nameSchema,
    phone: phoneSchema,
    governorate: z.preprocess((value) => {
      if (typeof value !== "string") return value;
      const normalized = value.trim().toLowerCase();
      return (
        GOVERNORATES.find(
          (governorate) =>
            governorate.id === normalized || governorate.name === value.trim(),
        )?.id ?? value
      );
    }, z.enum(GOVERNORATE_IDS)),
    address: addressSchema,
    district: districtSchema,
    notes: notesSchema,
    items: z.array(OrderItemInputSchema).min(1).max(20),
  }),
);

export type OrderRequest = z.infer<typeof OrderRequestSchema>;

export const OrderNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^EVA-[A-F0-9]{24}$/, "Invalid order number");

export const ProductStockStatusSchema = z.enum([
  "in_stock",
  "low_stock",
  "out_of_stock",
]);

export const ProductStockLabelSchema = z.enum([
  "متوفر",
  "كمية محدودة",
  "غير متوفر",
]);

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.string(),
  categoryId: z.string(),
  category: z.string(),
  price: z.number().int().nonnegative(),
  currency: z.literal("IQD"),
  unit: z.literal("m"),
  image: z.string(),
  color: z.string(),
  colors: z.array(z.string()).min(1),
  width: z.string(),
  composition: z.string(),
  stretch: z.string(),
  weight: z.string(),
  finish: z.string(),
  use: z.string(),
  description: z.string(),
  inStock: z.boolean(),
  stockQuantity: z.number().int().nonnegative(),
  stockStatus: ProductStockStatusSchema,
  stock: ProductStockLabelSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

export const SiteRouteSchema = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string(),
  header: z.boolean(),
});

export type SiteRoute = z.infer<typeof SiteRouteSchema>;

export const GovernorateSchema = z.object({
  id: z.enum(GOVERNORATE_IDS),
  name: z.string(),
  deliveryFee: z.number().int().nonnegative(),
});

export type Governorate = z.infer<typeof GovernorateSchema>;

export const ContactMessageSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  message: z.string(),
  status: z.literal("new"),
  createdAt: z.string().datetime(),
});

export type ContactMessage = z.infer<typeof ContactMessageSchema>;

export const OrderItemSchema = z.object({
  productId: z.string(),
  productSlug: z.string(),
  productName: z.string(),
  image: z.string(),
  color: z.string(),
  unitPrice: z.number().int().nonnegative(),
  quantity: z.number().finite().positive(),
  lineTotal: z.number().int().nonnegative(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: OrderNumberSchema,
  status: z.literal("pending"),
  customer: z.object({ name: z.string(), phone: z.string() }),
  governorate: z.string(),
  district: z.string(),
  address: z.string(),
  notes: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
  subtotal: z.number().int().nonnegative(),
  deliveryFee: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  currency: z.literal("IQD"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;

export const ProductListResponseSchema = z.object({
  data: z.array(ProductSchema),
  meta: z.object({ count: z.number().int().nonnegative() }),
});

export const ProductResponseSchema = z.object({ data: ProductSchema });
export const CategoryListResponseSchema = z.object({
  data: z.array(CategorySchema),
});
export const GovernorateListResponseSchema = z.object({
  data: z.array(GovernorateSchema),
});
export const ContactResponseSchema = z.object({ data: ContactMessageSchema });
export const OrderResponseSchema = z.object({ data: OrderSchema });
