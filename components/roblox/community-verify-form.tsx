type Props = {
  pageId: number;
  redirectTo: string;
  verificationCount: number;
  verifiedByCommunity: boolean;
};

export function CommunityVerifyForm({
  pageId,
  redirectTo,
  verificationCount,
  verifiedByCommunity
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Community verification</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Was this guide useful?</h2>
      <p className="mt-3 text-sm leading-7 text-slate-700">
        Verified pages enter the first sitemap batch and are prioritized for indexing. Current confirmations: {verificationCount}.
      </p>
      <div className="mt-4">
        {verifiedByCommunity ? (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Community verified
          </div>
        ) : (
          <form action="/api/community-verify" method="post">
            <input type="hidden" name="pageId" value={pageId} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              type="submit"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Mark as useful
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
