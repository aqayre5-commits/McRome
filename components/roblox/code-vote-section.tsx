'use client';

import { useState, useCallback } from 'react';
import type { GameCodeWithVotes, CodeVoteStatus } from '@/lib/types';

// ─── Status helpers ────────────────────────────────────────────────────────────

function getStatus(successRate: number | null, totalVotes: number): CodeVoteStatus {
  if (totalVotes === 0 || successRate === null) return 'unverified';
  if (successRate >= 90) return 'verified_active';
  if (successRate >= 50) return 'mixed';
  return 'likely_expired';
}

const STATUS_CONFIG: Record<CodeVoteStatus, { label: string; classes: string }> = {
  verified_active: {
    label: 'Verified Active',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  mixed: {
    label: 'Mixed Reports',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  likely_expired: {
    label: 'Likely Expired',
    classes: 'bg-red-100 text-red-800 border-red-200',
  },
  unverified: {
    label: 'Not yet verified',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

// ─── Per-code vote state ───────────────────────────────────────────────────────

type CodeState = {
  total: number;
  working: number;
  rate: number | null;
  /** null = not voted; true/false = the vote the user cast */
  userVote: boolean | null;
  /** true while the API call is in flight */
  pending: boolean;
  /** set when the user reports this code for moderation review */
  reported: boolean;
};

function buildInitialState(codes: GameCodeWithVotes[]): Map<number, CodeState> {
  return new Map(
    codes.map((c) => [
      c.id,
      {
        total:    c.total_votes_24h,
        working:  c.working_votes_24h,
        rate:     c.success_rate_24h,
        userVote: null,
        pending:  false,
        reported: false,
      },
    ])
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ successRate, totalVotes }: { successRate: number | null; totalVotes: number }) {
  const status = getStatus(successRate, totalVotes);
  const { label, classes } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
      {status === 'verified_active' && <span aria-hidden="true" className="mr-1">✅</span>}
      {status === 'mixed'           && <span aria-hidden="true" className="mr-1">⚠️</span>}
      {status === 'likely_expired'  && <span aria-hidden="true" className="mr-1">❌</span>}
      {label}
    </span>
  );
}

function VoteBar({ working, total }: { working: number; total: number }) {
  if (total === 0) return null;
  const pct = Math.round((100 * working) / total);
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            pct >= 90 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% working based on ${total} vote${total !== 1 ? 's' : ''}`}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {pct}% working · {total} vote{total !== 1 ? 's' : ''} in last 24h
      </p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

type Props = {
  codes: GameCodeWithVotes[];
};

export function CodeVoteSection({ codes }: Props) {
  const [voteState, setVoteState] = useState<Map<number, CodeState>>(() =>
    buildInitialState(codes)
  );

  const castVote = useCallback(
    async (codeId: number, isWorking: boolean) => {
      const prev = voteState.get(codeId);
      if (!prev || prev.pending) return;

      // ── Optimistic update ──
      const isNewVote    = prev.userVote === null;
      const isChangeVote = prev.userVote !== null && prev.userVote !== isWorking;

      let newTotal   = prev.total;
      let newWorking = prev.working;

      if (isNewVote) {
        newTotal  += 1;
        newWorking = isWorking ? prev.working + 1 : prev.working;
      } else if (isChangeVote) {
        // total stays the same; working flips by 1
        newWorking = isWorking ? prev.working + 1 : prev.working - 1;
      }

      const newRate = newTotal > 0 ? Math.round((100 * newWorking) / newTotal) : null;

      setVoteState((m) => {
        const next = new Map(m);
        next.set(codeId, { ...prev, total: newTotal, working: newWorking, rate: newRate, userVote: isWorking, pending: true });
        return next;
      });

      // ── API call ──
      try {
        const res = await fetch('/api/code-votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codeId, isWorking }),
        });

        if (res.ok) {
          // Reconcile with server-authoritative counts.
          const data = await res.json() as {
            total_votes_24h: number;
            working_votes_24h: number;
            success_rate_24h: number | null;
          };
          setVoteState((m) => {
            const next = new Map(m);
            next.set(codeId, {
              ...prev,
              total:    data.total_votes_24h,
              working:  data.working_votes_24h,
              rate:     data.success_rate_24h,
              userVote: isWorking,
              pending:  false,
              reported: prev.reported,
            });
            return next;
          });
        } else {
          throw new Error('non-ok response');
        }
      } catch {
        // ── Rollback on failure ──
        setVoteState((m) => {
          const next = new Map(m);
          next.set(codeId, { ...prev, pending: false });
          return next;
        });
      }
    },
    [voteState]
  );

  const reportCode = useCallback(
    async (codeId: number) => {
      const prev = voteState.get(codeId);
      if (!prev || prev.reported) return;

      setVoteState((m) => {
        const next = new Map(m);
        next.set(codeId, { ...prev, reported: true });
        return next;
      });

      try {
        await fetch('/api/code-votes/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codeId }),
        });
      } catch {
        // Rollback reported flag on failure.
        setVoteState((m) => {
          const next = new Map(m);
          next.set(codeId, { ...prev, reported: false });
          return next;
        });
      }
    },
    [voteState]
  );

  if (codes.length === 0) {
    return null; // section is invisible until codes are added to the DB
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
            Community verified
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Game codes
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Vote to keep the community updated · resets every 24h
        </p>
      </div>

      <ul className="mt-5 divide-y divide-slate-100" role="list">
        {codes.map((code) => {
          const state = voteState.get(code.id) ?? {
            total: 0, working: 0, rate: null, userVote: null, pending: false, reported: false,
          };
          const hasVoted = state.userVote !== null;

          return (
            <li key={code.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Code text — copyable on click */}
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(code.code_text).catch(() => undefined)}
                    aria-label={`Copy code ${code.code_text} to clipboard`}
                    className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-1 font-mono text-sm font-bold tracking-widest text-slate-900 transition-colors hover:border-brand-400 hover:bg-brand-50"
                  >
                    {code.code_text}
                  </button>

                  {code.description ? (
                    <p className="mt-1 text-sm text-slate-600">{code.description}</p>
                  ) : null}

                  <VoteBar working={state.working} total={state.total} />
                </div>

                <StatusBadge successRate={state.rate} totalVotes={state.total} />
              </div>

              {/* Vote buttons */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={state.pending}
                  onClick={() => castVote(code.id, true)}
                  aria-label={`Mark code ${code.code_text} as working`}
                  aria-pressed={state.userVote === true}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                    state.userVote === true
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  ✅ Working
                  {state.working > 0 && (
                    <span aria-hidden="true" className="ml-0.5 opacity-70">
                      ({state.working})
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={state.pending}
                  onClick={() => castVote(code.id, false)}
                  aria-label={`Mark code ${code.code_text} as expired`}
                  aria-pressed={state.userVote === false}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                    state.userVote === false
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                  }`}
                >
                  ❌ Expired
                  {state.total - state.working > 0 && (
                    <span aria-hidden="true" className="ml-0.5 opacity-70">
                      ({state.total - state.working})
                    </span>
                  )}
                </button>

                {hasVoted && !state.reported && (
                  <button
                    type="button"
                    onClick={() => reportCode(code.id)}
                    className="ml-auto text-[11px] text-slate-400 underline underline-offset-2 hover:text-red-500"
                    aria-label={`Report misuse for code ${code.code_text}`}
                  >
                    Report misuse
                  </button>
                )}
                {state.reported && (
                  <span className="ml-auto text-[11px] text-slate-400">Reported — thank you</span>
                )}
              </div>

              {/* Instant feedback message */}
              {state.pending && (
                <p className="mt-1.5 text-xs text-slate-400">Saving…</p>
              )}
              {hasVoted && !state.pending && (
                <p className="mt-1.5 text-xs text-slate-400" aria-live="polite">
                  Vote recorded. You can change it at any time.
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-slate-400">
        One vote per device per code. Success rates are calculated from the last 24 hours of votes only.
      </p>
    </section>
  );
}
