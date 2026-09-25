import { Heart, Plus, ShoppingBag } from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { formatPrice } from '@/lib/catalog'

interface ProductCardProps {
  product: Product
  wished: boolean
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

export function ProductCard({ product, wished, onWish, onAdd }: ProductCardProps) {
  const availableColor = product.colors.find((color) => color.available && color.stockMeters > 0)
  const soldOut = product.stockMeters <= 0 || !availableColor
  const lowStock = !soldOut && product.stockMeters <= 3

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link href={`/product/${product.slug}`} className="product-card-image-link" aria-label={`عرض تفاصيل ${product.name}`}>
          <img src={product.image} alt={product.name} className="product-card-image" loading="lazy" onError={(event) => { event.currentTarget.src = '/fabrics/hero.jpg' }} />
        </Link>
        <div className="product-card-badges">
          {product.isNew && <span className="badge badge-accent">جديد</span>}
          {lowStock && <span className="badge badge-warm">كمية محدودة</span>}
          {soldOut && <span className="badge badge-muted">غير متوفر</span>}
        </div>
        <button type="button" className={`product-wish ${wished ? 'is-active' : ''}`} onClick={() => onWish(product.slug)} aria-label={wished ? `إزالة ${product.name} من المفضلة` : `إضافة ${product.name} إلى المفضلة`} aria-pressed={wished}>
          <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-card-body">
        <div className="product-card-heading">
          <div>
            <p className="product-type">{product.type}</p>
            <Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link>
          </div>
          <span className="product-price">{formatPrice(product.price)}<small>/م</small></span>
        </div>
        <div className="product-card-footer">
          <div className="swatch-list" aria-label="الألوان المتاحة">
            {product.colors.slice(0, 5).map((color) => <span key={color.id} className={`mini-swatch ${color.available ? '' : 'is-muted'}`} style={{ backgroundColor: color.hex }} title={color.name} />)}
          </div>
          <button type="button" className="add-button" disabled={soldOut} onClick={() => availableColor && onAdd(product, availableColor, 0.5)}>
            {soldOut ? 'نفد المخزون' : <><ShoppingBag size={14} /><span>أضيفي ٠٫٥ م</span></>}
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="product-grid" aria-label="جارٍ تحميل الأقمشة" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="product-skeleton"><div /><span /><span /></div>)}
    </div>
  )
}

export function InlineAddButton({ product, onAdd }: { product: Product; onAdd: (product: Product, color: ProductColor, length: number) => void }) {
  const color = product.colors.find((item) => item.available && item.stockMeters > 0)
  return <button type="button" className="icon-button" disabled={!color} onClick={() => color && onAdd(product, color, 0.5)} aria-label={`إضافة ${product.name} إلى السلة`}><Plus size={18} /></button>
}
