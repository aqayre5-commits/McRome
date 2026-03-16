type Props = {
  pageId: number;
  redirectTo: string;
  countryCode: string;
};

export function BetaTesterSignupForm({ pageId, redirectTo, countryCode }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Lead magnet</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Beta tester signup</h2>
      <p className="mt-3 text-sm leading-7 text-slate-700">
        Collect launch-intent leads for new Roblox releases, updates, or event-driven trend spikes.
      </p>
      <form action="/api/beta-tester-signups" method="post" className="mt-4 space-y-3">
        <input type="hidden" name="pageId" value={pageId} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="countryCode" value={countryCode} />
        <input
          name="email"
          type="email"
          required
          placeholder="Email for beta invites"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-brand-500 focus:ring-2"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Join beta waitlist
        </button>
      </form>
    </section>
  );
}
