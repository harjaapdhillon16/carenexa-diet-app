'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { AuthGate } from '@/components/AuthGate';
import { JsonBlock } from '@/components/JsonBlock';
import { get, post } from '@/lib/api';
import { Diet } from '@/lib/types';
import { formatDate } from '@/lib/date';
import { useAuth } from '@/lib/auth';

const IconPdf = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v5h5" />
    <path d="M9 15h6" />
    <path d="M9 11h3" />
  </svg>
);

const IconShare = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    <path d="M12 3v12" />
    <path d="m7 8 5-5 5 5" />
  </svg>
);

export default function DietDetailPage({ params }: { params: { id: string } }) {
  const [diet, setDiet] = useState<Diet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pdfLink, setPdfLink] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingShare, setLoadingShare] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const { user, ready } = useAuth();

  function getPdfFileName(title?: string) {
    const base = (title || 'Carenexa Diet Plan').trim();
    const sanitized = base.replaceAll('/', '-').replaceAll('\\', '-').replaceAll(':', '-');
    return `${sanitized || 'Carenexa Diet Plan'}.pdf`;
  }

  async function triggerDownload(url: string, filename: string) {
    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  useEffect(() => {
    if (!ready || !user) return;
    async function loadDiet() {
      setError(null);
      try {
        const data = await get<Diet>(`/diet-app/diets/${params.id}`);
        setDiet(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load diet');
      }
    }

    loadDiet();
  }, [params.id, ready, user]);

  async function handlePdf() {
    if (loadingPdf) return;
    setActionError(null);
    setLoadingPdf(true);
    try {
      const data = await post<{ file_url?: string }>(`/diet-app/diets/${params.id}/pdf`);
      if (data?.file_url) {
        const baseUrlRaw = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
        const baseUrl = baseUrlRaw.endsWith('/') ? baseUrlRaw.slice(0, -1) : baseUrlRaw;
        const resolved = data.file_url.startsWith('http') ? data.file_url : `${baseUrl}${data.file_url}`;
        setPdfLink(resolved);
        if (resolved) {
          await triggerDownload(resolved, getPdfFileName(diet?.title));
        }
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to generate PDF');
    } finally {
      setLoadingPdf(false);
    }
  }

  async function handleShare() {
    if (loadingShare) return;
    setActionError(null);
    setLoadingShare(true);
    try {
      const data = await post<{ share_url?: string }>(`/diet-app/diets/${params.id}/share`);
      if (data?.share_url) {
        const baseUrlRaw = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
        const baseUrl = baseUrlRaw.endsWith('/') ? baseUrlRaw.slice(0, -1) : baseUrlRaw;
        const resolved = data.share_url.startsWith('http') ? data.share_url : `${baseUrl}${data.share_url}`;
        setShareLink(resolved);
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to create share link');
    } finally {
      setLoadingShare(false);
    }
  }

  const summary = diet?.diet_data?.summary || {};
  const days = Array.isArray(diet?.diet_data?.days) ? diet?.diet_data?.days : [];
  const profile = (diet?.profile_snapshot as any)?.profile || {};
  const location = (diet?.profile_snapshot as any)?.location || {};
  const preferences = (diet?.profile_snapshot as any)?.preferences || {};

  return (
    <AuthGate>
      <AppShell title="Diet Detail" subtitle="Detailed plan view">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl text-slate-900">Overview</h2>
              <p className="text-sm text-slate-500">Plan overview and actions.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-700"
                onClick={handlePdf}
                disabled={loadingPdf}
              >
                <IconPdf />
                {loadingPdf ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-700"
                onClick={handleShare}
                disabled={loadingShare}
              >
                <IconShare />
                {loadingShare ? 'Sharing...' : 'Share Link'}
              </button>
              <Link className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-700" href={`/diets/${params.id}/edit`}>
                Edit Diet
              </Link>
            </div>
          </div>
          {error && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">{error}</p>}
          {actionError && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{actionError}</p>}
          {(pdfLink || shareLink) && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {pdfLink && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-700">
                  PDF ready:{' '}
                  <a
                    className="font-semibold"
                    href={pdfLink}
                    download={getPdfFileName(diet?.title)}
                    onClick={(event) => {
                      event.preventDefault();
                      triggerDownload(pdfLink, getPdfFileName(diet?.title));
                    }}
                  >
                    Download
                  </a>
                </div>
              )}
              {shareLink && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-700">
                  Share link: <a className="font-semibold" href={shareLink}>{shareLink}</a>
                </div>
              )}
            </div>
          )}
          {diet ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Title</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{diet.title || 'Untitled Diet'}</div>
                <div className="mt-2 text-sm text-slate-500">Status: {diet.status || diet.generation_status || 'draft'}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Created</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{formatDate(diet.created_at)}</div>
                <div className="mt-2 text-sm text-slate-500">Generated {formatDate(diet.generated_at)}</div>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">No diet data found.</p>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-display text-lg text-slate-900">Profile Snapshot</h3>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-700"
              onClick={() => setShowRaw((prev) => !prev)}
            >
              {showRaw ? 'Hide raw JSON' : 'Show raw JSON'}
            </button>
          </div>
          {diet?.profile_snapshot ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile</div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Age</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{profile.age ?? '—'}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Gender</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{profile.gender ?? '—'}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Height</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{profile.height_cm ?? '—'} cm</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Weight</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{profile.weight_kg ?? '—'} kg</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Goal</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{profile.goal ?? '—'}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Activity</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{profile.activity_level ?? '—'}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-blue-600">
                    Smoker: {String(profile.smoker ?? '—')}
                  </span>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-600">
                    Alcohol: {profile.alcohol ?? '—'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Preferences</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                    Diet: {preferences.diet_type ?? '—'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                    Spice: {preferences.spice_level ?? '—'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                    Staples: {preferences.staples ?? '—'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                    City: {location.city ?? '—'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                    Pincode: {location.pincode ?? '—'}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Preferred cuisines</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(preferences.preferred_cuisines || []).length ? (
                      preferences.preferred_cuisines.map((cuisine: string) => (
                        <span key={cuisine} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-blue-600">
                          {cuisine}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Allergies</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(preferences.allergies || []).length ? (
                      preferences.allergies.map((item: string) => (
                        <span key={item} className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs text-rose-600">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None</span>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Dislikes</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(preferences.dislikes || []).length ? (
                      preferences.dislikes.map((item: string) => (
                        <span key={item} className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None</span>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Religious constraints</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(preferences.religious_constraints || []).length ? (
                      preferences.religious_constraints.map((item: string) => (
                        <span key={item} className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs text-purple-700">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None</span>
                    )}
                  </div>
                </div>
              </div>

              {showRaw && (
                <div className="lg:col-span-2">
                  <JsonBlock data={diet.profile_snapshot} />
                </div>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Profile snapshot missing.</p>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="font-display text-lg text-slate-900">Macro Summary</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Calories</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{summary.calories ?? '—'}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Protein</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{summary.protein_g ?? '—'} g</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Carbs</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{summary.carbs_g ?? '—'} g</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Fat</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{summary.fat_g ?? '—'} g</div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="font-display text-lg text-slate-900">7-Day Plan</h3>
          {days.length ? (
            <div className="mt-6 grid gap-6">
              {days.map((day: any) => (
                <div key={day.day} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Day {day.day}</div>
                      <div className="mt-1 text-lg font-semibold text-slate-900">{day.label || 'Day plan'}</div>
                    </div>
                    <div className="text-xs text-slate-500">{(day.meals || []).length} meals</div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {(day.meals || []).map((meal: any, idx: number) => (
                      <div key={`${meal.type}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{meal.type}</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">{meal.title}</div>
                        <ul className="mt-2 text-xs text-slate-500">
                          {(meal.portions || []).map((portion: any, portionIndex: number) => (
                            <li key={portionIndex}>
                              {portion.item}: {portion.qty}
                            </li>
                          ))}
                        </ul>
                        {meal.macros && (
                          <div className="mt-3 text-xs text-slate-500">
                            {meal.macros.cal} cal · {meal.macros.p}p · {meal.macros.c}c · {meal.macros.f}f
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Diet plan is empty.</p>
          )}
        </section>
      </AppShell>
    </AuthGate>
  );
}
