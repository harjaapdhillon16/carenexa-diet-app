'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { AuthGate } from '@/components/AuthGate';
import { get, put } from '@/lib/api';
import { Diet, DietStatus } from '@/lib/types';
import { useAuth } from '@/lib/auth';

export default function DietEditPage({ params }: { params: { id: string } }) {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<DietStatus>('draft');
  const [dietJson, setDietJson] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready || !user) return;
    async function loadDiet() {
      setError(null);
      try {
        const data = await get<Diet>(`/diet-app/diets/${params.id}`);
        setDiet(data);
        setTitle(data.title || '');
        setStatus((data.status as DietStatus) || 'draft');
        setDietJson(JSON.stringify(data.diet_data ?? {}, null, 2));
      } catch (err: any) {
        setError(err?.message || 'Failed to load diet');
      }
    }

    loadDiet();
  }, [params.id, ready, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    let parsedDiet: any = {};
    try {
      parsedDiet = JSON.parse(dietJson || '{}');
    } catch (err) {
      setLoading(false);
      setError('Diet JSON is invalid.');
      return;
    }

    try {
      const payload = {
        title,
        status,
        diet_data: parsedDiet
      };
      const updated = await put<Diet>(`/diet-app/diets/${params.id}`, payload);
      setDiet(updated);
      setSuccess('Diet updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to update diet');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGate>
      <AppShell title="Edit Diet" subtitle={`Plan ID ${params.id}`}>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl text-slate-900">Edit Diet</h2>
              <p className="text-sm text-slate-500">ID: {params.id}</p>
            </div>
            <Link className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700" href={`/diets/${params.id}`}>
              View Diet
            </Link>
          </div>
          {error && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">{error}</p>}
          {success && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</p>}
          {diet ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Title</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DietStatus)}
                  >
                    <option value="draft">Draft</option>
                    <option value="finalized">Finalized</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Diet JSON</label>
                <textarea
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs"
                  rows={16}
                  value={dietJson}
                  onChange={(e) => setDietJson(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-panel" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-6 text-sm text-slate-500">Loading diet...</p>
          )}
        </section>
      </AppShell>
    </AuthGate>
  );
}
