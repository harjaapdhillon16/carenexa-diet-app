'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { AuthGate } from '@/components/AuthGate';
import { JsonBlock } from '@/components/JsonBlock';
import { get } from '@/lib/api';
import { DashboardSummary } from '@/lib/types';
import { daysAgo, toISODate } from '@/lib/date';
import { useAuth } from '@/lib/auth';

const presets = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: 'custom', value: null }
] as const;

export default function DashboardPage() {
  const [range, setRange] = useState<string>('7d');
  const [from, setFrom] = useState<string>(toISODate(daysAgo(7)));
  const [to, setTo] = useState<string>(toISODate(new Date()));
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, ready } = useAuth();

  const rangeValue = useMemo(() => {
    const selected = presets.find((preset) => preset.label === range);
    return selected?.value ?? null;
  }, [range]);

  useEffect(() => {
    if (rangeValue) {
      setFrom(toISODate(daysAgo(rangeValue)));
      setTo(toISODate(new Date()));
    }
  }, [rangeValue]);

  async function loadSummary() {
    setLoading(true);
    setError(null);
    try {
      const data = await get<DashboardSummary>(
        `/diet-app/dashboard/summary?from=${from}&to=${to}`
      );
      setSummary(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || !user) return;
    loadSummary();
  }, [from, to, ready, user]);

  return (
    <AuthGate>
      <AppShell title="Dashboard" subtitle="Analytics across generated diets">
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total generated</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">
              {summary?.total_diets_generated ?? summary?.total ?? 0}
            </div>
            <div className="mt-1 text-sm text-slate-500">Diets generated in range</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Range</div>
            <div className="mt-3 text-lg font-semibold text-slate-900">{from} → {to}</div>
            <div className="mt-1 text-sm text-slate-500">Filtered window</div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h2 className="font-display text-xl text-slate-900">Date range</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Date Range</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={range}
                onChange={(event) => setRange(event.target.value)}
              >
                {presets.map((preset) => (
                  <option key={preset.label} value={preset.label}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">From</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                disabled={range !== 'custom'}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">To</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                disabled={range !== 'custom'}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-panel"
              onClick={loadSummary}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh Summary'}
            </button>
            {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">{error}</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="font-display text-lg text-slate-900">Raw Summary Payload</h3>
          {summary ? (
            <div className="mt-4">
              <JsonBlock data={summary} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No summary data yet.</p>
          )}
        </section>
      </AppShell>
    </AuthGate>
  );
}
