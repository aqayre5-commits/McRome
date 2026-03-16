import { Container } from '@/components/ui/container';

export const metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next ?? '/dashboard';
  const error = params.error;

  return (
    <div className="py-12">
      <Container>
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Admin access</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Admin sign in</h1>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Restricted to authorised accounts only.
          </p>

          {error === 'credentials' ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              Invalid email or password. Please try again.
            </div>
          ) : error === 'invalid' ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              Please enter a valid email and password.
            </div>
          ) : null}

          <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="username"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-brand-300 transition focus:ring"
                placeholder="admin@example.com"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">Password</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-brand-300 transition focus:ring"
                placeholder="••••••••"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Sign in
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}
