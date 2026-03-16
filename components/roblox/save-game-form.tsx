type Props = {
  pageId: number;
  redirectTo: string;
  intent?: 'save' | 'remove';
  label?: string;
};

export function SaveGameForm({
  pageId,
  redirectTo,
  intent = 'save',
  label
}: Props) {
  const buttonLabel = label ?? (intent === 'save' ? 'Save to dashboard' : 'Remove');

  return (
    <form action="/api/saved-games" method="post">
      <input type="hidden" name="pageId" value={pageId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="intent" value={intent} />
      <button
        type="submit"
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
