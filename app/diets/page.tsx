'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { AuthGate } from '@/components/AuthGate';
import { get, post, del } from '@/lib/api';
import { Diet, DietListResponse } from '@/lib/types';
import { formatDate } from '@/lib/date';
import { useAuth } from '@/lib/auth';

function extractList(response: DietListResponse): Diet[] {
  if (Array.isArray(response)) return response;
  return response.data || response.items || response.diets || [];
}

const IconView = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  </svg>
);

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

const IconTrash = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
  </svg>
);

function ActionButton({
  children,
  tone = 'default',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'default' | 'danger' }) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition';
  const toneClass =
    tone === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300'
      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';
  return (
    <button className={`${base} ${toneClass}`} {...props}>
      {children}
    </button>
  );
}

function ActionLink({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}

function getPdfFileName(title?: string) {
  const base = (title || 'Carenexa Diet Plan').trim();
  const sanitized = base.replaceAll('/', '-').replaceAll('\\', '-').replaceAll(':', '-');
  return `${sanitized || 'Carenexa Diet Plan'}.pdf`;
}

function resolveBackendUrl(path: string) {
  if (path.startsWith('http')) return path;
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const fallback = 'http://127.0.0.1:5000';
  const source = raw || fallback;
  const base = source.endsWith('/') ? source.slice(0, -1) : source;
  return `${base}${path}`;
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

export default function DietsPage() {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLinks, setShareLinks] = useState<Record<string, string>>({});
  const [pdfLinks, setPdfLinks] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Diet | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user, ready } = useAuth();

  async function loadDiets() {
    setLoading(true);
    setError(null);
    try {
      const data = await get<DietListResponse>('/diet-app/diets');
      setDiets(extractList(data));
    } catch (err: any) {
      setError(err?.message || 'Failed to load diets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || !user) return;
    loadDiets();
  }, [ready, user]);

  async function handleDelete(id: string) {
    if (deleting) return;
    setDeleting(true);
    try {
      await del(`/diet-app/diets/${id}`);
      setDiets((prev) => prev.filter((diet) => diet.id !== id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete diet');
    } finally {
      setDeleting(false);
    }
  }

  async function handleShare(id: string) {
    try {
      const data = await post<{ share_url?: string }>(`/diet-app/diets/${id}/share`);
      if (data?.share_url) {
        setShareLinks((prev) => ({ ...prev, [id]: data.share_url! }));
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create share link');
    }
  }

  async function handlePdf(id: string) {
    try {
      const data = await post<{ file_url?: string }>(`/diet-app/diets/${id}/pdf`);
      if (data?.file_url) {
        const resolved = resolveBackendUrl(data.file_url);
        setPdfLinks((prev) => ({ ...prev, [id]: resolved }));
        const title = diets.find((diet) => diet.id === id)?.title;
        await triggerDownload(resolved, getPdfFileName(title));
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate PDF');
    }
  }

  const rows = useMemo(() => diets, [diets]);

  return (
    <AuthGate>
      <AppShell title="Diet Library" subtitle="Generated plans and shared assets">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl text-slate-900">All Diets</h2>
              <p className="text-sm text-slate-500">Manage AI and manual plans.</p>
            </div>
            <Link className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-panel" href="/diets/new">
              New Diet
            </Link>
          </div>
          {error && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">{error}</p>}
          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Loading diets...</p>
          ) : rows.length ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Generated</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((diet) => (
                    <tr key={diet.id} className="bg-white">
                      <td className="px-4 py-3">
                        <Link href={`/diets/${diet.id}`} className="font-medium text-slate-900">
                          {diet.title || 'Untitled Diet'}
                        </Link>
                        <div className="text-xs text-slate-400">ID: {diet.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-600">
                          {diet.status || diet.generation_status || 'draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(diet.created_at || diet.generated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <ActionLink href={`/diets/${diet.id}`}>
                            <IconView />
                            View
                          </ActionLink>
                          <ActionLink href={`/diets/${diet.id}/edit`}>
                            <IconEdit />
                            Edit
                          </ActionLink>
                          <ActionButton onClick={() => handlePdf(diet.id)}>
                            <IconPdf />
                            PDF
                          </ActionButton>
                          <ActionButton onClick={() => handleShare(diet.id)}>
                            <IconShare />
                            Share
                          </ActionButton>
                          <ActionButton tone="danger" onClick={() => setDeleteTarget(diet)}>
                            <IconTrash />
                            Delete
                          </ActionButton>
                        </div>
                        {pdfLinks[diet.id] && (
                          <p className="mt-2 text-xs text-slate-500">
                            PDF:{' '}
                            <a
                              className="text-blue-600"
                              href={pdfLinks[diet.id]}
                              download={getPdfFileName(diet.title)}
                              onClick={(event) => {
                                event.preventDefault();
                                triggerDownload(pdfLinks[diet.id], getPdfFileName(diet.title));
                              }}
                            >
                              Download
                            </a>
                          </p>
                        )}
                        {shareLinks[diet.id] && (
                          <p className="mt-1 text-xs text-slate-500">
                            Share: <a className="text-blue-600" href={shareLinks[diet.id]}>{shareLinks[diet.id]}</a>
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">No diets found yet.</p>
          )}
        </section>

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-rose-500">Confirm delete</div>
                  <h3 className="mt-2 font-display text-xl text-slate-900">Delete this diet plan?</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    This will permanently remove <span className="font-semibold text-slate-700">{deleteTarget.title || 'Untitled Diet'}</span>.
                    Shared links and PDFs will be removed too.
                  </p>
                </div>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 hover:border-slate-400"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Close
                </button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <button
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-slate-400"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-panel disabled:opacity-60"
                  onClick={() => handleDelete(deleteTarget.id)}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete diet'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </AuthGate>
  );
}
