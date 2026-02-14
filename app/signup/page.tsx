'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { login, signup } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoginResponse } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  const { login: setAuthUser } = useAuth();

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTnc, setAcceptTnc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!acceptTnc) {
      setError('Please accept the terms to continue.');
      return;
    }

    setLoading(true);

    try {
      await signup<{ message?: string }>({
        firstname,
        lastname,
        email,
        password,
        acceptTnc
      });
      const data = await login<LoginResponse>(email, password);
      if (data?.id) {
        setAuthUser({
          id: data.id,
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
          role: data.role,
          status: data.status
        });
        router.replace('/dashboard');
        return;
      }
      router.replace('/login');
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header />
      <section className="min-h-screen py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-panel">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Carenexa Diet
              </div>
              <h2 className="mt-4 font-display text-2xl text-slate-900">Onboard your team in minutes.</h2>
              <p className="mt-3 text-sm text-slate-500">
                Create a Carenexa Diet account and start generating AI-native meal plans
                with the same backend and data you already trust.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Outputs</div>
                  <div className="mt-2 text-sm font-semibold">Structured JSON</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Security</div>
                  <div className="mt-2 text-sm font-semibold">Same credentials</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-panel">
              <h2 className="font-display text-2xl text-slate-900">Create your Carenexa Diet account</h2>
              <p className="mt-2 text-sm text-slate-500">Use your official work email address.</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-400">First name</label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Last name</label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      required
                    />
                  </div>
                </div>
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
                <label className="flex items-center gap-3 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={acceptTnc}
                    onChange={(e) => setAcceptTnc(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  I agree to the Carenexa Diet terms & privacy policy.
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-panel" type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>
                  <button
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm text-slate-700"
                    type="button"
                    onClick={() => {
                      setFirstname('');
                      setLastname('');
                      setEmail('');
                      setPassword('');
                    }}
                  >
                    Clear
                  </button>
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
