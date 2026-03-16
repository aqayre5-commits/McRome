import { ButtonLink } from '@/components/ui/button-link';

export function PaywallCta() {
  return (
    <aside className="rounded-3xl border border-brand-200 bg-brand-50 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Pro upgrade</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
        Save game pages and keep a personal dashboard
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-700">
        Public guides remain open. Pro adds account tools: saved games, billing-managed access, and a placeholder for weekly meta alerts.
      </p>
      <div className="mt-5 flex gap-3">
        <ButtonLink href="/pricing">View Pro</ButtonLink>
        <ButtonLink href="/login" variant="secondary">Sign in</ButtonLink>
      </div>
    </aside>
  );
}
