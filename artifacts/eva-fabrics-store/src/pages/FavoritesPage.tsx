import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { ProductCard } from '@/components/ProductCard'

interface FavoritesPageProps {
  products: Product[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

export function FavoritesPage({ products, wishlist, onWish, onAdd }: FavoritesPageProps) {
  const favoriteProducts = products.filter((product) => wishlist.includes(product.slug))
  if (favoriteProducts.length === 0) return <main className="container-eva empty-state page-empty"><div className="empty-icon"><Heart size={25} /></div><h1>لم تحفظي أقمشة بعد</h1><p>اضغطي على القلب في أي نموذج ليظهر هنا.</p><Link href="/catalog" className="button button-primary">اكتشفي الأقمشة <ArrowLeft size={16} /></Link></main>
  return <main className="container-eva favorites-page"><div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>›</span><span>المفضلة</span></div><div className="page-title-row"><div><span className="eyebrow">اختياراتك المحفوظة</span><h1>المفضلة</h1><p>{favoriteProducts.length} نماذج بانتظارك</p></div><Link href="/catalog" className="underlined-link">متابعة التسوق <ArrowLeft size={15} /></Link></div><div className="product-grid">{favoriteProducts.map((product) => <ProductCard key={product.id} product={product} wished onWish={onWish} onAdd={onAdd} />)}</div><div className="favorites-note"><ShoppingBag size={18} /><span>يمكنك نقل أي قطعة إلى السلة مباشرة من هنا.</span></div></main>
}
