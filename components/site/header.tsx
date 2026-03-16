import { headers } from 'next/headers';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getCurrentUser } from '@/lib/data/public';
import { getRequestCountry } from '@/lib/geo';
import { getCountryRate } from '@/lib/constants/robux-rates';

export async function Header() {
  const [user, headerList] = await Promise.all([getCurrentUser(), headers()]);
  const country = getRequestCountry(headerList);
  const rate = getCountryRate(country);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container>
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="McRome" className="h-9 w-9 rounded-xl" />
            <span className="text-base font-bold text-slate-900">McRome</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/games" className="text-slate-700 hover:text-slate-900">Games</Link>

            {/* Detected region indicator — updates on every request via Vercel edge headers */}
            <span
              title={`Detected region: ${rate.label}`}
              aria-label={`Your detected region: ${rate.label}`}
              className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 sm:inline-flex"
            >
              <span aria-hidden="true">{rate.flag}</span>
              <span>{rate.symbol} · {country}</span>
            </span>

            {/* Dashboard link for authenticated users only — no sign-in CTA for public visitors */}
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              >
                Dashboard
              </Link>
            ) : null}
          </nav>
        </div>
      </Container>
    </header>
  );
}
