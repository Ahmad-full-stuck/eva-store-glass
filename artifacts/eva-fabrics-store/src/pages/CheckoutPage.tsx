import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, MapPin, Phone, UserRound } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import type { CartItem, CheckoutForm, OrderPayload } from '@/types'
import { formatMeters, formatPrice, getCartTotals, getOrderNumber } from '@/lib/catalog'
import { apiUrl, siteConfig } from '@/lib/site'
import { governorates } from '@/lib/fallback-data'

interface CheckoutPageProps {
  cart: CartItem[]
  onComplete: (orderNumber: string) => void
}

const initialForm: CheckoutForm = { name: '', phone: '', email: '', governorate: '', district: '', address: '', notes: '' }

type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>

const validPhone = (value: string): boolean => /^(?:07\d{9}|9647\d{9}|\+9647\d{9})$/.test(value.replace(/[\s()-]/g, ''))

export function CheckoutPage({ cart, onComplete }: CheckoutPageProps) {
  const [location, navigate] = useLocation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [submitState, setSubmitState] = useState<'idle' | 'loading'>('idle')
  const [serverError, setServerError] = useState('')
  const totals = getCartTotals(cart)

  if (cart.length === 0) return <main className="container-eva empty-state page-empty"><div className="empty-icon"><Check size={25} /></div><h1>لا توجد عناصر لإتمام الطلب</h1><p>أضيفي قماشاً إلى السلة أولاً.</p><Link href="/catalog" className="button button-primary">العودة إلى الكتالوج <ArrowLeft size={16} /></Link></main>

  const update = (key: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validateStep = (currentStep: number): boolean => {
    const nextErrors: CheckoutErrors = {}
    if (currentStep === 1) {
      if (form.name.trim().length < 3) nextErrors.name = 'اكتبي الاسم الكامل'
      if (!validPhone(form.phone)) nextErrors.phone = 'أدخلي رقم هاتف عراقي صحيحاً'
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'البريد الإلكتروني غير صحيح'
    }
    if (currentStep === 2) {
      if (!form.governorate) nextErrors.governorate = 'اختاري المحافظة'
      if (form.district.trim().length < 2) nextErrors.district = 'أدخلي المنطقة أو القضاء'
      if (form.address.trim().length < 8) nextErrors.address = 'أضيفي عنواناً أوضح'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep((current) => Math.min(3, current + 1))
  }

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault()
    if (!validateStep(1) || !validateStep(2)) return
    setSubmitState('loading')
    setServerError('')
    const payload: OrderPayload = {
      customerName: form.name.trim(),
      phone: form.phone.replace(/[\s()-]/g, ''),
      email: form.email.trim() || undefined,
      governorate: form.governorate,
      district: form.district.trim(),
      address: form.address.trim(),
      notes: form.notes.trim() || undefined,
      items: cart.map((item) => ({ productId: item.product.id, productSlug: item.product.slug, productName: item.product.name, colorId: item.color.id, color: item.color.hex, colorName: item.color.name, quantity: item.length, unitPrice: item.product.price, totalPrice: item.product.price * item.length })),
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
    }
    try {
      const response = await fetch(apiUrl('/api/orders'), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...payload, shippingAddress: { governorate: payload.governorate, district: payload.district, address: payload.address } }) })
      const responseBody: unknown = await response.json().catch(() => null)
      if (!response.ok) throw new Error(errorMessage(responseBody, 'تعذر حفظ الطلب على الخادم'))
      const orderNumber = getOrderNumber(responseBody)
      if (!orderNumber) throw new Error('استجاب الخادم دون رقم طلب صالح، لم نعتبر العملية ناجحة')
      onComplete(orderNumber)
    } catch (error) {
      setSubmitState('idle')
      setServerError(error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الطلب، حاولي مرة أخرى')
    }
  }

  return <main className="container-eva checkout-page"><div className="breadcrumbs"><Link href="/cart">السلة</Link><span>›</span><span>إتمام الطلب</span></div><div className="checkout-top"><div><span className="eyebrow">خطوات بسيطة وواضحة</span><h1>إتمام الطلب</h1></div><Link href={`/cart${location.includes('?') ? location.slice(location.indexOf('?')) : ''}`} className="underlined-link"><ArrowRight size={15} />العودة للسلة</Link></div><CheckoutSteps step={step} /><form className="checkout-layout" onSubmit={submitOrder} noValidate><section className="checkout-form-card"><h2>{step === 1 ? 'بيانات التواصل' : step === 2 ? 'تفاصيل التوصيل' : 'مراجعة الطلب'}</h2>{step === 1 && <ContactFields form={form} errors={errors} update={update} />}{step === 2 && <DeliveryFields form={form} errors={errors} update={update} />}{step === 3 && <ReviewStep form={form} cart={cart} edit={() => setStep(1)} />}{serverError && <div className="server-error" role="alert"><CircleAlert size={18} /><span>{serverError}</span></div>}<div className="checkout-actions">{step > 1 ? <button type="button" className="button button-outline" onClick={() => setStep((current) => current - 1)}>السابق</button> : <span />}{step < 3 ? <button type="button" className="button button-primary" onClick={next}>التالي <ArrowLeft size={16} /></button> : <button type="submit" className="button button-primary" disabled={submitState === 'loading'}>{submitState === 'loading' ? <><LoaderCircle className="spin" size={17} />جارٍ إرسال الطلب</> : <>تأكيد الطلب <ArrowLeft size={16} /></>}</button>}</div>{step === 3 && <p className="checkout-terms">بإرسال الطلب توافقين على <Link href="/policies#terms">شروط الاستخدام</Link> و<Link href="/policies#privacy">سياسة الخصوصية</Link>.</p>}</section><aside className="checkout-summary"><h2>ملخص طلبك</h2><div className="checkout-items">{cart.map((item) => <div className="checkout-item" key={`${item.product.slug}-${item.color.id}`}><img src={item.product.image} alt="" /><div><strong>{item.product.name}</strong><span>{item.color.name} · {formatMeters(item.length)}</span></div><b>{formatPrice(item.product.price * item.length)}</b></div>)}</div><div className="summary-line"><span>المجموع الفرعي</span><strong>{formatPrice(totals.subtotal)}</strong></div><div className="summary-line"><span>التوصيل</span><strong>{totals.deliveryFee ? formatPrice(totals.deliveryFee) : 'مجاناً'}</strong></div><div className="summary-total"><span>الإجمالي</span><strong>{formatPrice(totals.total)}</strong></div><div className="checkout-secure"><Check size={15} />السلة والمجموع محفوظان قبل الإرسال</div></aside></form></main>
}

function CheckoutSteps({ step }: { step: number }) { return <div className="checkout-steps" aria-label="مراحل الطلب">{['التواصل', 'التوصيل', 'المراجعة'].map((label, index) => { const number = index + 1; return <div className={`checkout-step ${step >= number ? 'is-done' : ''} ${step === number ? 'is-current' : ''}`} key={label}><span>{step > number ? <Check size={14} /> : number}</span><small>{label}</small></div> })}</div> }
function ContactFields({ form, errors, update }: { form: CheckoutForm; errors: CheckoutErrors; update: (key: keyof CheckoutForm, value: string) => void }) { return <div className="form-fields"><Field label="الاسم الكامل" id="name" value={form.name} error={errors.name} onChange={(value) => update('name', value)} placeholder="مثال: سارة أحمد" autoComplete="name" icon={<UserRound size={17} />} /><Field label="رقم الهاتف" id="phone" value={form.phone} error={errors.phone} onChange={(value) => update('phone', value)} placeholder="07XXXXXXXXX" type="tel" autoComplete="tel" icon={<Phone size={17} />} /><Field label="البريد الإلكتروني" id="email" value={form.email} error={errors.email} onChange={(value) => update('email', value)} placeholder="اختياري" type="email" autoComplete="email" /></div> }
function DeliveryFields({ form, errors, update }: { form: CheckoutForm; errors: CheckoutErrors; update: (key: keyof CheckoutForm, value: string) => void }) { return <div className="form-fields"><div className="field"><label htmlFor="governorate">المحافظة</label><div className="field-input"><MapPin size={17} /><select id="governorate" value={form.governorate} onChange={(event) => update('governorate', event.target.value)}><option value="">اختاري المحافظة</option>{governorates.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>{errors.governorate && <small className="field-error">{errors.governorate}</small>}</div><Field label="المنطقة أو القضاء" id="district" value={form.district} error={errors.district} onChange={(value) => update('district', value)} placeholder="مثال: الكرادة" /><div className="field"><label htmlFor="address">العنوان بالتفصيل</label><textarea id="address" value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="المحلة، الشارع، رقم المنزل وأي علامة مميزة" rows={4} aria-invalid={Boolean(errors.address)} />{errors.address && <small className="field-error">{errors.address}</small>}</div><div className="field"><label htmlFor="notes">ملاحظات للتوصيل <small>(اختياري)</small></label><textarea id="notes" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="وقت مناسب للتوصيل أو تعليمات إضافية" rows={3} /></div></div> }
function ReviewStep({ form, cart, edit }: { form: CheckoutForm; cart: CartItem[]; edit: () => void }) { return <div className="review-step"><div className="review-block"><div><strong>بيانات التوصيل</strong><button type="button" onClick={edit}>تعديل</button></div><p>{form.name}</p><p>{form.phone}</p><p>{form.governorate}، {form.district}</p><p>{form.address}</p>{form.notes && <p className="review-muted">ملاحظات: {form.notes}</p>}</div><div className="review-block"><strong>العناصر ({cart.length})</strong>{cart.map((item) => <div className="review-item" key={`${item.product.slug}-${item.color.id}`}><span>{item.product.name} · {item.color.name}</span><b>{formatMeters(item.length)}</b></div>)}</div></div> }
function Field({ label, id, value, error, onChange, placeholder, type = 'text', autoComplete, icon }: { label: string; id: string; value: string; error?: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string; icon?: React.ReactNode }) { return <div className="field"><label htmlFor={id}>{label}{error && <span className="required-mark">*</span>}</label><div className="field-input">{icon}<input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} /></div>{error && <small className="field-error" id={`${id}-error`}>{error}</small>}</div> }
function errorMessage(payload: unknown, fallback: string): string { if (payload && typeof payload === 'object') { const record = payload as Record<string, unknown>; for (const key of ['message', 'error', 'detail']) if (typeof record[key] === 'string' && record[key]) return record[key] as string } return fallback }
