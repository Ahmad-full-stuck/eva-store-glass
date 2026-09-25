import { ArrowLeft } from 'lucide-react'
import { Link } from 'wouter'

export default function NotFound() {
  return <main className="container-eva empty-state page-empty"><div className="empty-icon">404</div><h1>الصفحة غير موجودة</h1><p>الرابط الذي فتحته غير متاح، لكن يمكنك العودة إلى المعرض واختيار خامة أخرى.</p><Link href="/catalog" className="button button-primary">العودة إلى الأقمشة <ArrowLeft size={16} /></Link></main>
}
