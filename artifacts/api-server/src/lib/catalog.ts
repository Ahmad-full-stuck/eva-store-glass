import {
  CATEGORIES,
  CategorySchema,
  GOVERNORATES,
  GovernorateSchema,
  ProductSchema,
  SITE_ROUTES,
  SiteRouteSchema,
  type Category,
  type Governorate,
  type Product,
  type SiteRoute,
} from "./schemas";

export const seedCategories: readonly Category[] = CATEGORIES.map((category) =>
  CategorySchema.parse(category),
);

export const seedGovernorates: readonly Governorate[] = GOVERNORATES.map(
  (governorate) => GovernorateSchema.parse(governorate),
);

export const seedRoutes: readonly SiteRoute[] = SITE_ROUTES.map((route) =>
  SiteRouteSchema.parse(route),
);

export const seedProducts: readonly Product[] = [
  {
    id: "product_aubergine_embroidered",
    slug: "aubergine-embroidered",
    name: "قماش مطرز أرجواني",
    type: "مطرز",
    categoryId: "embroidered",
    category: "مطرز",
    price: 18500,
    currency: "IQD",
    unit: "m",
    image: "/fabrics/hero.jpg",
    color: "أرجواني",
    colors: ["#40243f", "#c55b78", "#d9b0a4"],
    width: "١٤٠ سم",
    composition: "بوليستر",
    stretch: "غير مطاطي",
    weight: "متوسط",
    finish: "تطريز لامع خفيف",
    use: "فساتين المناسبات والعباءات",
    description:
      "عينة عرض توضيحية بتطريز ناعم يلتقط الضوء بهدوء، لتصوّر طريقة اكتشاف تفاصيل القماش قبل الشراء.",
    inStock: true,
    stockQuantity: 25,
    stockStatus: "in_stock",
    stock: "متوفر",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "product_cobalt_velvet",
    slug: "cobalt-velvet",
    name: "قماش مخملي أزرق كوبالت",
    type: "مخملي",
    categoryId: "solid",
    category: "سادة",
    price: 14200,
    currency: "IQD",
    unit: "m",
    image: "/fabrics/blue.jpg",
    color: "أزرق كوبالت",
    colors: ["#214e86", "#5b2938"],
    width: "١٥٠ سم",
    composition: "بوليستر",
    stretch: "مرونة خفيفة",
    weight: "متوسط إلى ثقيل",
    finish: "وبرة ناعمة",
    use: "جاكيتات وفساتين",
    description: "ملمس غني وعمق لون واضح في عينة مصوّرة بإضاءة طبيعية.",
    inStock: true,
    stockQuantity: 18,
    stockStatus: "in_stock",
    stock: "متوفر",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "product_rose_embroidered",
    slug: "rose-embroidered",
    name: "قماش وردي بتطريز هندسي",
    type: "مطرز",
    categoryId: "embroidered",
    category: "مطرز",
    price: 21750,
    currency: "IQD",
    unit: "m",
    image: "/fabrics/rose.jpg",
    color: "وردي غباري",
    colors: ["#d7a6a2", "#e3d3c7"],
    width: "١٤٠ سم",
    composition: "مزيج نسيجي",
    stretch: "غير مطاطي",
    weight: "خفيف",
    finish: "تطريز هندسي",
    use: "قمصان وقطع ناعمة",
    description:
      "نقشة هندسية هادئة وملمس خفيف يناسب القطع ذات الحركة الانسيابية.",
    inStock: true,
    stockQuantity: 4,
    stockStatus: "low_stock",
    stock: "كمية محدودة",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "product_emerald_stretch",
    slug: "emerald-stretch",
    name: "قماش ساتان مطاطي زمردي",
    type: "سبانديكس",
    categoryId: "spandex",
    category: "سبانديكس",
    price: 12800,
    currency: "IQD",
    unit: "m",
    image: "/fabrics/emerald.jpg",
    color: "زمردي",
    colors: ["#21715d", "#352c52", "#b75c55"],
    width: "١٥٠ سم",
    composition: "بوليستر وسبانديكس",
    stretch: "مطاطي ثنائي الاتجاه",
    weight: "خفيف إلى متوسط",
    finish: "لمعة ساتان",
    use: "فساتين السهرة والملابس المرنة",
    description:
      "سطح ساتان بلمعة محسوبة مع مرونة عملية، موضّح هنا كعينة تجريبية.",
    inStock: true,
    stockQuantity: 22,
    stockStatus: "in_stock",
    stock: "متوفر",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "product_sand_twill",
    slug: "sand-twill",
    name: "قماش تويل رملي",
    type: "تويل",
    categoryId: "solid",
    category: "سادة",
    price: 9900,
    currency: "IQD",
    unit: "m",
    image: "/fabrics/rose.jpg",
    color: "رملي",
    colors: ["#c9ab82", "#776452"],
    width: "١٤٥ سم",
    composition: "قطن مخلوط",
    stretch: "غير مطاطي",
    weight: "متوسط",
    finish: "نسيج قطري واضح",
    use: "بناطيل وتنانير وقطع يومية",
    description:
      "نسيج قطري عملي بلون محايد، مناسب لقراءة بنية القماش واختبار الاستخدام.",
    inStock: true,
    stockQuantity: 30,
    stockStatus: "in_stock",
    stock: "متوفر",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "product_midnight_sequin",
    slug: "midnight-sequin",
    name: "قماش ترتر ليلي",
    type: "ترتر ولمّاع",
    categoryId: "sequin",
    category: "ترتر ولمّاع",
    price: 24600,
    currency: "IQD",
    unit: "m",
    image: "/fabrics/blue.jpg",
    color: "كحلي",
    colors: ["#172c52", "#6b2e4e"],
    width: "١٣٥ سم",
    composition: "بوليستر",
    stretch: "مرونة خفيفة",
    weight: "متوسط",
    finish: "ترتر صغير",
    use: "تفاصيل السهرة والقطع الاحتفالية",
    description:
      "عينة بترتر صغير تظهر حركة الضوء على السطح، وهي غير متاحة للطلب في هذا العرض.",
    inStock: false,
    stockQuantity: 0,
    stockStatus: "out_of_stock",
    stock: "غير متوفر",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
].map((product) => ProductSchema.parse(product));

export function findCategory(
  value: string,
  categories: readonly Category[] = seedCategories,
): Category | undefined {
  const normalized = value.trim().toLowerCase();
  return categories.find(
    (category) =>
      category.id.toLowerCase() === normalized ||
      category.slug.toLowerCase() === normalized ||
      category.name === value.trim(),
  );
}

export function findGovernorate(
  value: string,
  governorates: readonly Governorate[] = seedGovernorates,
): Governorate | undefined {
  const normalized = value.trim().toLowerCase();
  return governorates.find(
    (governorate) =>
      governorate.id.toLowerCase() === normalized ||
      governorate.name === value.trim(),
  );
}
