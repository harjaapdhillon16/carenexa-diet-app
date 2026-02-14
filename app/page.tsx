'use client';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <Container className="pt-20 pb-16 text-center lg:pt-32">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
            Create personalized diet plans{' '}
            <span className="relative whitespace-nowrap text-blue-600">
              <span className="relative">in seconds</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
            AI-powered nutrition planning for Indian diets. Just enter your patient's details, 
            and get a complete 7-day meal plan ready to share.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Get Started
              </Link>
            )}
            {/* <Link
              href="/diet-app"
              className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Try it out
            </Link> */}
          </div>
        </Container>

        {/* How it works */}
        <Container className="py-16 bg-slate-50">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Creating a diet plan is as simple as 1-2-3
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                Enter patient details
              </h3>
              <p className="mt-2 text-slate-600">
                Age, city, food preferences, and health goals
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                AI creates the plan
              </h3>
              <p className="mt-2 text-slate-600">
                Get a complete 7-day meal plan with Indian recipes
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                Share with patients
              </h3>
              <p className="mt-2 text-slate-600">
                Download as PDF or send a shareable link
              </p>
            </div>
          </div>
        </Container>

        {/* Features */}
        <Container className="py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900">
                🇮🇳 Made for India
              </h3>
              <p className="mt-2 text-slate-600">
                Regional cuisines, local ingredients, and Indian dietary preferences built in
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900">
                ⚖️ Balanced nutrition
              </h3>
              <p className="mt-2 text-slate-600">
                Proper protein, carbs, and fats for each meal and day
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900">
                📄 Patient-ready PDFs
              </h3>
              <p className="mt-2 text-slate-600">
                Clean, professional meal plans ready to print or share
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900">
                🔒 Secure & private
              </h3>
              <p className="mt-2 text-slate-600">
                Your data stays with you. We don't store patient information
              </p>
            </div>
          </div>
        </Container>

        {/* CTA Section */}
        <Container className="py-16 bg-blue-50">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Create your first diet plan in under a minute
            </p>
            <div className="mt-8">
              <Link
                href={user ? '/dashboard' : '/sign-up'}
                className="rounded-md bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                {user ? 'Open Dashboard' : 'Create Free Account'}
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}