import { Link } from 'wouter'

interface LogoProps {
  light?: boolean
}

export function Logo({ light = false }: LogoProps) {
  return (
    <Link href="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="إيفا ستور، الصفحة الرئيسية">
      <span className="logo-symbol" aria-hidden="true">
        <span />
      </span>
      <span className="logo-copy">
        <strong>إيفا ستور</strong>
        <small>للأقمشة</small>
      </span>
    </Link>
  )
}
