'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Diets', href: '/diets' },
  { label: 'Generate', href: '/diets/new' }
];

export function AppShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="flex flex-col gap-6 border-r border-slate-200/80 bg-white/90 p-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
            CD
          </div>
          <div>
            <div className="font-display text-lg">Carenexa Diet</div>
            <div className="text-xs text-slate-500">Enterprise Console</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Core</div>
          <nav className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                  pathname === item.href
                    ? 'border-blue-200 bg-blue-50 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Insights</div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-blue-500">AI signals</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">Diet quality</div>
            <div className="mt-1 text-xs text-slate-500">
              Monitor macro balance and adherence.
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-600">
              {user?.firstname?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {user?.firstname ? `${user.firstname} ${user.lastname ?? ''}` : user?.email}
              </div>
              <div className="text-xs text-slate-500">Role {user?.role ?? '—'}</div>
            </div>
          </div>
          <button
            className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-slate-400"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="px-6 py-6 lg:px-10">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="font-display text-2xl text-slate-900">{title}</div>
            {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
              <span>⌕</span>
              <input
                className="w-40 bg-transparent text-sm text-slate-600 outline-none"
                placeholder="Search diets, users, insights"
              />
            </div>
            <Link className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-panel" href="/diets/new">
              Generate Diet
            </Link>
          </div>
        </header>
        <main className="mt-6 grid gap-6">{children}</main>
      </div>
    </div>
  );
}
