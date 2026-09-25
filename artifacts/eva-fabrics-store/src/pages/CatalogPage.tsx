import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, Filter, Search, SlidersHorizontal, X } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import type { Category, Product, ProductColor } from '@/types'
import { matchesProductSearch, formatPrice } from '@/lib/catalog'
import { ProductCard, ProductGridSkeleton } from '@/components/ProductCard'
import { Modal } from '@/components/Modal'

interface CatalogPageProps {
  products: Product[]
  categories: Category[]
  status: 'loading' | 'ready' | 'fallback'
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

const getParams = (location: string): URLSearchParams => new URLSearchParams(location.includes('?') ? location.slice(location.indexOf('?') + 1) : '')

export function CatalogPage({ products, categories, status, wishlist, onWish, onAdd }: CatalogPageProps) {
  const [location, navigate] = useLocation()
  const params = useMemo(() => getParams(location), [location])
  const [searchInput, setSearchInput] = useState(params.get('search') || '')
  const [filterOpen, setFilterOpen] = useState(false)
  const categoryId = params.get('category') || ''
  const search = params.get('search') || ''
  const stretch = params.get('stretch') || 'all'
  const stock = params.get('stock') === '1'
  const minPrice = Number(params.get('min') || '')
  const maxPrice = Number(params.get('max') || '')
  const sort = params.get('sort') || 'featured'

  useEffect(() => setSearchInput(search), [search])

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => value === null || value === '' ? next.delete(key) : next.set(key, value))
    const query = next.toString()
    navigate(`/catalog${query ? `?${query}` : ''}`)
  }

  const clearFilters = () => {
    setSearchInput('')
    navigate('/catalog')
  }

  const shown = useMemo(() => {
    let list = products.filter((product) => {
      const categoryMatch = !categoryId || product.categoryId === categoryId || categories.find((item) => item.id === categoryId)?.name === product.categoryId
      const categoryOk = !categoryId || product.categoryId === categoryId || categories.some((item) => (item.id === categoryId || item.name === categoryId) && item.name === categories.find((category) => category.id === product.categoryId)?.name)
      const stretchOk = stretch === 'all' || (stretch === '1' ? product.specs.isStretch : !product.specs.isStretch)
      const stockOk = !stock || product.stockMeters > 0
      const minOk = !Number.isFinite(minPrice) || minPrice <= 0 || product.price >= minPrice
      const maxOk = !Number.isFinite(maxPrice) || maxPrice <= 0 || product.price <= maxPrice
      return categoryMatch && categoryOk && stretchOk && stockOk && minOk && maxOk && matchesProductSearch(product, search)
    })
    list = [...list]
    if (sort === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'featured') list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    return list
  }, [categories, categoryId, maxPrice, minPrice, products, search, sort, stock, stretch])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    updateParams({ search: searchInput.trim() || null })
  }

  const activeCategory = categories.find((category) => category.id === categoryId || category.name === categoryId)
  const filterCount = Number(Boolean(categoryId)) + Number(stretch !== 'all') + Number(stock) + Number(Boolean(minPrice)) + Number(Boolean(maxPrice)) + Number(Boolean(search))

  return (
    <main className="container-eva catalog-page">
      <div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>›</span><span>الأقمشة</span>{activeCategory && <><span>›</span><span>{activeCategory.name}</span></>}</div>
      <div className="catalog-heading"><div><span className="eyebrow">معرض الخامات</span><h1>{activeCategory ? activeCategory.name : 'كل الأقمشة'}</h1><p>{shown.length} من {products.length} نموذجاً · {status === 'fallback' ? 'نسخة محلية جاهزة' : 'تحديث مباشر عند توفر API'}</p></div><div className="catalog-sort"><label htmlFor="catalog-sort">ترتيب حسب</label><select id="catalog-sort" value={sort} onChange={(event) => updateParams({ sort: event.target.value === 'featured' ? null : event.target.value })}><option value="featured">الترتيب الافتراضي</option><option value="newest">الأحدث أولاً</option><option value="price-asc">السعر: الأقل أولاً</option><option value="price-desc">السعر: الأعلى أولاً</option></select></div></div>
      <div className="catalog-mobile-tools"><button type="button" className="filter-trigger" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={16} />تصفية {filterCount > 0 && <b>{filterCount}</b>}</button><Link href="/catalog?sort=newest" className="underlined-link">وصل حديثاً</Link></div>
      <div className="catalog-layout">
        <aside className="filter-sidebar" aria-label="تصفية الأقمشة"><FilterPanel categories={categories} categoryId={categoryId} stretch={stretch} stock={stock} minPrice={minPrice} maxPrice={maxPrice} onChange={updateParams} onClear={clearFilters} /></aside>
        <section className="catalog-results" aria-label="نتائج الأقمشة">
          <form className="catalog-search" onSubmit={submitSearch} role="search"><Search size={18} /><label className="sr-only" htmlFor="catalog-search">ابحثي في النتائج</label><input id="catalog-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="ابحثي باسم القماش أو اللون أو الاستخدام" />{searchInput && <button type="button" onClick={() => { setSearchInput(''); updateParams({ search: null }) }} aria-label="مسح البحث"><X size={16} /></button>}<button type="submit" className="button button-primary button-small">بحث</button></form>
          {filterCount > 0 && <div className="active-filters"><span>مرشحات:</span>{search && <FilterChip label={`بحث: ${search}`} onRemove={() => updateParams({ search: null })} />}{activeCategory && <FilterChip label={activeCategory.name} onRemove={() => updateParams({ category: null })} />}{stretch !== 'all' && <FilterChip label={stretch === '1' ? 'مطاطي' : 'غير مطاطي'} onRemove={() => updateParams({ stretch: null })} />}{stock && <FilterChip label="متوفر فقط" onRemove={() => updateParams({ stock: null })} />}{(minPrice > 0 || maxPrice > 0) && <FilterChip label={`${minPrice || 0} - ${maxPrice || '∞'} د.ع`} onRemove={() => updateParams({ min: null, max: null })} />}<button type="button" className="clear-all" onClick={clearFilters}>مسح الكل</button></div>}
          {status === 'loading' && products.length === 0 ? <ProductGridSkeleton /> : shown.length === 0 ? <EmptyResults onClear={clearFilters} /> : <div className="product-grid">{shown.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.slug)} onWish={onWish} onAdd={onAdd} />)}</div>}
        </section>
      </div>
      <Modal open={filterOpen} onClose={() => setFilterOpen(false)} title="تصفية الأقمشة" variant="bottom" className="filter-drawer"><div className="drawer-header"><h2>تصفية النتائج</h2><button type="button" className="icon-button" onClick={() => setFilterOpen(false)} aria-label="إغلاق التصفية"><X size={19} /></button></div><FilterPanel categories={categories} categoryId={categoryId} stretch={stretch} stock={stock} minPrice={minPrice} maxPrice={maxPrice} onChange={updateParams} onClear={clearFilters} /><button type="button" className="button button-primary drawer-submit" onClick={() => setFilterOpen(false)}>عرض النتائج ({shown.length}) <Check size={16} /></button></Modal>
    </main>
  )
}

function FilterPanel({ categories, categoryId, stretch, stock, minPrice, maxPrice, onChange, onClear }: { categories: Category[]; categoryId: string; stretch: string; stock: boolean; minPrice: number; maxPrice: number; onChange: (changes: Record<string, string | null>) => void; onClear: () => void }) {
  return <div className="filter-panel"><div className="filter-panel-title"><strong>التصفية</strong><button type="button" onClick={onClear}>مسح الكل</button></div><fieldset><legend>نوع القماش</legend>{[{ id: '', name: 'كل الأنواع' }, ...categories].map((category) => <label className="filter-option" key={category.id || 'all'}><input type="radio" name="category" checked={category.id === categoryId || (!categoryId && !category.id)} onChange={() => onChange({ category: category.id || null })} /><span>{category.name}</span></label>)}</fieldset><fieldset><legend>المرونة</legend><label className="filter-option"><input type="radio" name="stretch" checked={stretch === 'all'} onChange={() => onChange({ stretch: null })} /><span>الكل</span></label><label className="filter-option"><input type="radio" name="stretch" checked={stretch === '1'} onChange={() => onChange({ stretch: '1' })} /><span>مطاطي</span></label><label className="filter-option"><input type="radio" name="stretch" checked={stretch === '0'} onChange={() => onChange({ stretch: '0' })} /><span>غير مطاطي</span></label></fieldset><fieldset><legend>نطاق السعر</legend><div className="price-fields"><label><span>من</span><input type="number" min="0" inputMode="numeric" value={minPrice > 0 ? minPrice : ''} onChange={(event) => onChange({ min: event.target.value || null })} placeholder="السعر الأدنى" /></label><span>—</span><label><span>إلى</span><input type="number" min="0" inputMode="numeric" value={maxPrice > 0 ? maxPrice : ''} onChange={(event) => onChange({ max: event.target.value || null })} placeholder="السعر الأعلى" /></label></div></fieldset><label className="filter-option filter-check"><input type="checkbox" checked={stock} onChange={(event) => onChange({ stock: event.target.checked ? '1' : null })} /><span>المتوفر فقط</span></label><Link className="filter-browse" to="/catalog">تصفحي كل الخيارات <ArrowLeft size={14} /></Link></div>
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <span className="filter-chip">{label}<button type="button" onClick={onRemove} aria-label={`إزالة ${label}`}><X size={12} /></button></span>
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return <div className="empty-state"><div className="empty-icon"><Filter size={23} /></div><h2>لم نجد خامة بهذه المواصفات</h2><p>جرّبي كلمة بحث مختلفة أو أزيلي بعض الفلاتر.</p><button type="button" className="button button-primary" onClick={onClear}>عرض كل الأقمشة</button></div>
}
