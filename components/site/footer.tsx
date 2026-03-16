import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 gap-8 md:grid-cols-3">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-black text-white">McRome</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Fast answers, verified codes, and regional Robux pricing for every Roblox game.
          </p>
        </div>

        {/* Guides + Company */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Guides</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/games" className="hover:text-white transition-colors">All Games</Link></li>
              <li><Link href="/blog/roblox-essentials" className="hover:text-white transition-colors">2026 Starter Guide</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-12 max-w-6xl border-t border-slate-900 pt-8 text-[10px] uppercase tracking-tighter text-slate-600">
        &copy; {new Date().getFullYear()} McRome. Not affiliated with Roblox Corporation.
      </div>
    </footer>
  );
}
