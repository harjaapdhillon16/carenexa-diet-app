'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { login } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoginResponse } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const { login: setAuthUser, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      router.replace(next);
    }
  }, [user, next, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login<LoginResponse>(email, password);
      if (!data?.id) {
        throw new Error('Invalid login response');
      }
      setAuthUser({
        id: data.id,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        role: data.role,
        status: data.status
      });
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header />
      <section className="min-h-screen py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-panel">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                Carenexa Diet
              </div>
              <h2 className="mt-4 font-display text-2xl text-slate-900">Enterprise AI nutrition, now unified.</h2>
              <p className="mt-3 text-sm text-slate-500">
                Log in to the Carenexa Diet console and manage AI diet workflows
                across your clinical teams.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Security</div>
                  <div className="mt-2 text-sm font-semibold">Shared credentials</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Outputs</div>
                  <div className="mt-2 text-sm font-semibold">7-day precision</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-panel">
              <h2 className="font-display text-2xl text-slate-900">Sign in to Carenexa Diet</h2>
              <p className="mt-2 text-sm text-slate-500">
                Use your existing credentials to access the console.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Password</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-panel" type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                  <Link className="rounded-full border border-slate-200 px-5 py-2 text-sm text-slate-700" href="/signup">
                    Create account
                  </Link>
                </div>
                {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p>}
              </form>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
