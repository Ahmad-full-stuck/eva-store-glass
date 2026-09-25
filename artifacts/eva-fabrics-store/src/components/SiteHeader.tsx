import { useEffect, useState } from 'react'
import { Heart, Instagram, Menu, MessageCircle, Search, ShoppingBag, X } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import type { SiteRoute } from '@/types'
import { formatMeters } from '@/lib/catalog'
import { siteConfig } from '@/lib/site'
import { Logo } from './Logo'
import { Modal } from './Modal'
import { SearchDialog } from './SearchDialog'
import type { Product } from '@/types'

interface SiteHeaderProps {
  routes: SiteRoute[]
  products: Product[]
  cartMeters: number
  wishlistCount: number
}

export function SiteHeader({ routes, products, cartMeters, wishlistCount }: SiteHeaderProps) {
  const [location] = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = location.split('?')[0]
  const mainRoutes = routes.filter((route) => route.header)
  const fallbackLinks = [
    { id: 'catalog', label: 'الأقمشة', path: '/catalog', header: true },
    { id: 'about', label: 'من نحن', path: '/about', header: true },
    { id: 'guide', label: 'دليل الأقمشة', path: '/fabric-guide', header: true },
  ]
  const links = mainRoutes.length >= 3 ? mainRoutes : [...mainRoutes, ...fallbackLinks.filter((item) => !mainRoutes.some((route) => route.id === item.id))]

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <div className="announcement-bar">
        <span>شحن إلى جميع محافظات العراق</span>
        <span className="announcement-dot" />
        <a href={`tel:${siteConfig.phone}`} dir="ltr">{siteConfig.phone}</a>
        <span className="announcement-dot" />
        <span>شحن دولي عند التوفر</span>
      </div>
      <header className="site-header">
        <div className="container-eva header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            {links.slice(0, 5).map((route) => <Link key={route.id} href={route.path} className={pathname === route.path.split('?')[0] ? 'is-active' : ''}>{route.label}</Link>)}
          </nav>
          <div className="header-actions">
            <button type="button" className="icon-button" onClick={() => setSearchOpen(true)} aria-label="فتح البحث"><Search size={19} /></button>
            <Link href="/favorites" className="icon-button favorite-header" aria-label={`المفضلة، ${wishlistCount} عناصر`}><Heart size={19} />{wishlistCount > 0 && <span>{wishlistCount}</span>}</Link>
            <Link href="/cart" className="cart-button" aria-label={`السلة، ${formatMeters(cartMeters)}`}><ShoppingBag size={17} /><span>السلة</span>{cartMeters > 0 && <b>{formatMeters(cartMeters)}</b>}</Link>
            <button type="button" className="icon-button menu-toggle" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة"><Menu size={20} /></button>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} products={products} />
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="قائمة التنقل" variant="drawer" className="mobile-drawer">
        <div className="drawer-header"><Logo /><button type="button" className="icon-button" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة"><X size={20} /></button></div>
        <nav className="mobile-nav" aria-label="التنقل عبر الهاتف">
          {[...links, { id: 'favorites', label: 'المفضلة', path: '/favorites', header: false }, { id: 'contact', label: 'تواصلي معنا', path: '/contact', header: false }, { id: 'tracking', label: 'تتبع الطلب', path: '/order-tracking', header: false }].map((route) => <Link key={route.id} href={route.path}>{route.label}</Link>)}
        </nav>
        <div className="drawer-contact"><a href={siteConfig.whatsappUrl()} target="_blank" rel="noreferrer"><MessageCircle size={17} />تواصلي عبر واتساب</a><a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={17} />حساب إيفا على إنستغرام</a></div>
      </Modal>
    </>
  )
}
