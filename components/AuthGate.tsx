'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${next}`);
    }
  }, [ready, user, pathname, router]);

  if (!ready) {
    return <div className="min-h-[60vh] grid place-items-center text-sm text-slate-500">Checking session...</div>;
  }

  if (!user) {
    return <div className="min-h-[60vh] grid place-items-center text-sm text-slate-500">Redirecting to login...</div>;
  }

  return <>{children}</>;
}
