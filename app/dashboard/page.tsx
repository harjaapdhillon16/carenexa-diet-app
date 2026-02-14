'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { AuthGate } from '@/components/AuthGate';
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

type BreakdownRow = {
  label?: string | null;
  bucket?: string | null;
  count?: number | string | null;
};

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

  const totalGenerated = summary?.total_diets_generated ?? summary?.total ?? summary?.total_diets ?? 0;
  const timeSeries = Array.isArray(summary?.time_series) ? summary?.time_series : [];
  const breakdowns = summary?.breakdowns || {};

  const getBreakdown = (key: string) => {
    const rows = breakdowns?.[key];
    if (!Array.isArray(rows)) return [];
    return rows.map((row: BreakdownRow) => ({
      label: row?.label ?? row?.bucket ?? 'Unknown',
      count: Number(row?.count ?? 0)
    }));
  };

  return (
    <AuthGate>
      <AppShell title="Dashboard" subtitle="Analytics across generated diets">
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total generated</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">
              {totalGenerated}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg text-slate-900">Summary Overview</h3>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              {timeSeries.length} days tracked
            </div>
          </div>

          {!summary ? (
            <p className="mt-4 text-sm text-slate-500">No summary data yet.</p>
          ) : (
            <>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total diets</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{totalGenerated}</div>
                  <p className="mt-1 text-xs text-slate-500">Generated in range</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Active breakdowns</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {Object.keys(breakdowns || {}).length}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Demographic + preference splits</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Peak day</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {timeSeries.length
                      ? (() => {
                          const top = [...timeSeries].sort((a: any, b: any) => Number(b.count) - Number(a.count))[0];
                          return `${top.day} · ${top.count}`;
                        })()
                      : '—'}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Highest daily volume</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Daily trend</div>
                  <div className="mt-3 grid gap-3">
                    {timeSeries.length ? (
                      timeSeries.map((point: any) => (
                        <div key={point.day} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
                          <span className="text-slate-600">{point.day}</span>
                          <span className="font-semibold text-slate-900">{point.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No daily data yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Top cities</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getBreakdown('city').length ? (
                      getBreakdown('city').slice(0, 10).map((row) => (
                        <span
                          key={`${row.label}-${row.count}`}
                          className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-blue-700"
                        >
                          {row.label} · {row.count}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No city data yet.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { key: 'age_buckets', title: 'Age buckets', tone: 'border-slate-200' },
                  { key: 'gender', title: 'Gender', tone: 'border-slate-200' },
                  { key: 'height_buckets', title: 'Height buckets', tone: 'border-slate-200' },
                  { key: 'smoker', title: 'Smoker', tone: 'border-slate-200' },
                  { key: 'alcohol', title: 'Alcohol', tone: 'border-slate-200' },
                  { key: 'diet_type', title: 'Diet type', tone: 'border-slate-200' },
                  { key: 'pincode', title: 'Pincode', tone: 'border-slate-200' }
                ].map((card) => (
                  <div key={card.key} className={`rounded-2xl border ${card.tone} bg-white p-4`}>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.title}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {getBreakdown(card.key).length ? (
                        getBreakdown(card.key).map((row) => (
                          <span
                            key={`${card.key}-${row.label}-${row.count}`}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                          >
                            {row.label} · {row.count}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No data</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </AppShell>
    </AuthGate>
  );
}
