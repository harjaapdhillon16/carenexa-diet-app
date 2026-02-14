import Link from 'next/link';
import { Container } from './Container';

export function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <Container className="py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="font-display text-xl" href="/">
            Carenexa Diet
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/diets" className="hover:text-slate-900">
              Diets
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-800 hover:border-slate-400"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
