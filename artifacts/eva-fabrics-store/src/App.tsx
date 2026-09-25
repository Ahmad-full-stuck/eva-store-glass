import { useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { Link } from 'wouter'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import type { CartItem, Product, ProductColor } from '@/types'
import { useStoreData } from '@/hooks/use-store-data'
import { addCartItem, getStoredCart, getStoredWishlist, reconcileCart, removeCartItem, setStoredCart, setStoredWishlist, updateCartItem } from '@/lib/storage'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { HomePage } from '@/pages/HomePage'
import { CatalogPage } from '@/pages/CatalogPage'
import { ProductPage } from '@/pages/ProductPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { AboutPage, ContactPage, FabricGuidePage, OrderConfirmationPage, OrderTrackingPage, PoliciesPage } from '@/pages/InfoPages'
import NotFound from '@/pages/not-found'

function App() {
  const { products, categories, routes, status } = useStoreData()
  const [location, setLocation] = useLocation()
  const [cart, setCart] = useState<CartItem[]>(() => getStoredCart(products))
  const [wishlist, setWishlist] = useState<string[]>(() => getStoredWishlist())
  const [notice, setNotice] = useState('')
  const pathname = location.split('?')[0]

  useEffect(() => {
    setCart((current) => {
      const next = reconcileCart(current, products)
      return next.length === current.length ? current : next
    })
  }, [products])

  useEffect(() => {
    setStoredCart(cart)
  }, [cart])

  useEffect(() => {
    setStoredWishlist(wishlist)
  }, [wishlist])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  const addToCart = (product: Product, color: ProductColor, length: number) => {
    const result = addCartItem(cart, product, color, length)
    if (!result.available) {
      setNotice('هذه الخامة غير متوفرة حالياً')
      return
    }
    setCart(result.cart)
    setNotice(result.capped ? `أضيفت الكمية المتاحة فقط من «${product.name}»` : `أضيف «${product.name}» إلى السلة`)
  }

  const toggleWishlist = (slug: string) => {
    setWishlist((current) => {
      const exists = current.includes(slug)
      setNotice(exists ? 'أزيل القماش من المفضلة' : 'حُفظ القماش في المفضلة')
      return exists ? current.filter((item) => item !== slug) : [...current, slug]
    })
  }

  const updateCart = (key: string, length: number) => setCart((current) => updateCartItem(current, key, length))
  const deleteCart = (key: string) => setCart((current) => removeCartItem(current, key))
  const completeOrder = (orderNumber: string) => {
    setCart([])
    setStoredCart([])
    setNotice('تم تسجيل طلبك بنجاح')
    setLocation(`/order-confirmation/${encodeURIComponent(orderNumber)}`)
  }
  const cartMeters = cart.reduce((sum, item) => sum + item.length, 0)
  const pageProps = { products, categories, wishlist, onWish: toggleWishlist, onAdd: addToCart }

  return <div className="app-shell" dir="rtl"><SiteHeader routes={routes} products={products} cartMeters={cartMeters} wishlistCount={wishlist.length} /><Switch><Route path="/" component={() => <HomePage {...pageProps} />} /><Route path="/catalog" component={() => <CatalogPage {...pageProps} status={status} />} /><Route path="/product/:slug">{(params) => <ProductPage {...pageProps} slug={params.slug} />}</Route><Route path="/cart" component={() => <CartPage cart={cart} onUpdate={updateCart} onRemove={deleteCart} />} /><Route path="/checkout" component={() => <CheckoutPage cart={cart} onComplete={completeOrder} />} /><Route path="/favorites" component={() => <FavoritesPage {...pageProps} />} /><Route path="/about" component={AboutPage} /><Route path="/fabric-guide" component={FabricGuidePage} /><Route path="/contact" component={ContactPage} /><Route path="/policies" component={PoliciesPage} /><Route path="/order-tracking" component={OrderTrackingPage} /><Route path="/order-confirmation/:orderNumber">{(params) => <OrderConfirmationPage orderNumber={decodeURIComponent(params.orderNumber)} />}</Route><Route component={NotFound} /></Switch><SiteFooter routes={routes} categories={categories} />{notice && <div className="toast" role="status" aria-live="polite"><span className="toast-icon"><Check size={15} /></span><span>{notice}</span>{notice.includes('السلة') && <Link href="/cart" className="toast-link"><ShoppingBag size={14} />السلة</Link>}{notice.includes('المفضلة') && <Link href="/favorites" className="toast-link">المفضلة</Link>}<button type="button" className="toast-close" onClick={() => setNotice('')} aria-label="إغلاق التنبيه"><ArrowLeft size={14} /></button></div>}</div>
}

export default App
