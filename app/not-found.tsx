import Link from 'next/link';
import { Container } from '@/components/ui/container';

export default function NotFound() {
  return (
    <div className="py-16">
      <Container>
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Page not found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            The requested page is unavailable or not published.
          </p>
          <Link
            href="/games"
            className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            View games
          </Link>
        </div>
      </Container>
    </div>
  );
}
