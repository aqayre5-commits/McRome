import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { getCurrentSubscription, getCurrentUser } from '@/lib/data/public';

export const metadata = {
  title: 'Account',
  robots: { index: false, follow: false }
};

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ portal?: string; checkout?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  const [subscription, sp] = await Promise.all([
    getCurrentSubscription(user.id),
    searchParams
  ]);

  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          {sp.checkout === 'success' ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Subscription activated.
            </div>
          ) : null}
          {sp.portal === 'error' ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              Billing portal could not be opened. Please try again.
            </div>
          ) : null}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Account</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Billing and plan</h1>

            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Email</dt>
                <dd className="mt-2 text-sm text-slate-900">{user.email}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Subscription status</dt>
                <dd className="mt-2 text-sm text-slate-900">{subscription?.status ?? 'inactive'}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <form action="/api/stripe/portal" method="post">
                <button
                  type="submit"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Open billing portal
                </button>
              </form>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
