import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { SaveGameForm } from '@/components/roblox/save-game-form';
import { getCurrentSubscription, getCurrentUser, getSavedGames } from '@/lib/data/public';
import { isActiveSubscription } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false }
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const [subscription, savedGames] = await Promise.all([
    getCurrentSubscription(user.id),
    getSavedGames(user.id)
  ]);

  const isPro = isActiveSubscription(subscription?.status);

  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="space-y-6">
          <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Saved games</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="rounded-full bg-slate-100 px-3 py-1">Email: {user.email}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Plan: {isPro ? 'Pro' : 'Free'}
              </span>
              <Link href="/account" className="rounded-full bg-slate-100 px-3 py-1 hover:bg-slate-200">
                Account
              </Link>
            </div>
          </header>

          {!isPro ? (
            <section className="rounded-3xl border border-brand-200 bg-brand-50 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Upgrade required for dashboard retention</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Free users can read public guides. Pro unlocks persistent saved games and billing-managed account tools.
              </p>
              <Link
                href="/pricing"
                className="mt-5 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                View pricing
              </Link>
            </section>
          ) : null}

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">Saved game list</h2>

            {!savedGames.length ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
                No saved games yet.
              </div>
            ) : (
              <div className="space-y-4">
                {savedGames.map((saved) => (
                  <article key={`${saved.user_id}-${saved.page_id}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-950">
                          <Link href={saved.roblox_pages?.slug ? `/games/${saved.roblox_pages.slug}` : '/games'} className="hover:text-brand-700">
                            {saved.roblox_pages?.name ?? `Game ${saved.page_id}`}
                          </Link>
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-700">
                          {saved.roblox_pages?.useful_summary ?? 'Guide summary pending.'}
                        </p>
                      </div>
                      <SaveGameForm
                        pageId={saved.page_id}
                        redirectTo="/dashboard"
                        intent="remove"
                        label="Remove"
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
