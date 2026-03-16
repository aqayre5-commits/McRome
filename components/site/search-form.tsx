type Props = {
  defaultValue?: string;
  action?: string;
};

export function SearchForm({ defaultValue = '', action = '/games' }: Props) {
  return (
    <form action={action} method="get" className="flex flex-col gap-3 md:flex-row">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search Roblox games"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-brand-300 transition focus:ring"
      />
      <button
        type="submit"
        className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Search
      </button>
    </form>
  );
}
