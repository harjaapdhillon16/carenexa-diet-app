'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { AuthGate } from '@/components/AuthGate';
import { JsonBlock } from '@/components/JsonBlock';
import { post } from '@/lib/api';
import { Diet } from '@/lib/types';

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function NewDietPage() {
  const [title, setTitle] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [smoker, setSmoker] = useState('false');
  const [alcohol, setAlcohol] = useState('none');
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [dietType, setDietType] = useState('veg');
  const [preferredCuisines, setPreferredCuisines] = useState('north_indian, south_indian');
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [staples, setStaples] = useState('mixed');
  const [allergies, setAllergies] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [religious, setReligious] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Diet | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!city && !pincode) {
      setError('Provide at least a city or a pincode.');
      return;
    }

    const payload = {
      title: title || undefined,
      profile: {
        age: age ? Number(age) : undefined,
        gender,
        height_cm: height ? Number(height) : undefined,
        weight_kg: weight ? Number(weight) : undefined,
        smoker: smoker === 'true',
        alcohol,
        activity_level: activity,
        goal
      },
      location: {
        city: city || undefined,
        pincode: pincode || undefined
      },
      preferences: {
        diet_type: dietType,
        preferred_cuisines: splitList(preferredCuisines),
        spice_level: spiceLevel,
        staples,
        allergies: splitList(allergies),
        dislikes: splitList(dislikes),
        religious_constraints: splitList(religious)
      }
    };

    setLoading(true);
    try {
      const data = await post<Diet>('/diet-app/diets/generate', payload);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate diet');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGate>
      <AppShell title="Generate Diet" subtitle="Capture profile, location, and cuisine inputs">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <div>
            <h2 className="font-display text-xl text-slate-900">Diet Intake</h2>
          </div>
          {loading && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Generating diet plan</div>
                  <div className="text-xs text-slate-500">
                    Building macros, meals, and regional cuisine preferences.
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  AI working...
                </div>
              </div>
            </div>
          )}
          {result && !loading && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Diet generated successfully</div>
                  <div className="text-xs text-slate-500">Your AI plan is ready to review.</div>
                </div>
                {result.id && (
                  <Link
                    href={`/diets/${result.id}`}
                    className="ml-auto rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    View plan
                  </Link>
                )}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Name</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Patient Name"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Age</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Gender</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Height (cm)</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Weight (kg)</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Smoker</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={smoker}
                  onChange={(e) => setSmoker(e.target.value)}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Alcohol</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={alcohol}
                  onChange={(e) => setAlcohol(e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="social">Social</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Activity Level</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Goal</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Maintain, lose, gain"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">City</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Pincode</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Diet Type</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                >
                  <option value="veg">Veg</option>
                  <option value="jain">Jain</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="non_veg">Non-veg</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Preferred Cuisines</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={preferredCuisines}
                  onChange={(e) => setPreferredCuisines(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-400">Comma-separated values.</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Spice Level</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={spiceLevel}
                  onChange={(e) => setSpiceLevel(e.target.value)}
                >
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="spicy">Spicy</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Staples</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={staples}
                  onChange={(e) => setStaples(e.target.value)}
                >
                  <option value="rice">Rice</option>
                  <option value="roti">Roti</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Allergies</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Peanuts, dairy"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Dislikes</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={dislikes}
                  onChange={(e) => setDislikes(e.target.value)}
                  placeholder="Bitter gourd"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Religious Constraints</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  value={religious}
                  onChange={(e) => setReligious(e.target.value)}
                  placeholder="no_onion_no_garlic"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-panel" type="submit" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Diet'}
              </button>
              {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">{error}</p>}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg text-slate-900">Generated Summary</h3>
              <p className="text-sm text-slate-500">Review macros and plan structure.</p>
            </div>
            {result?.id && (
              <Link className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-700" href={`/diets/${result.id}`}>
                Open detail view
              </Link>
            )}
          </div>
          {result ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Calories</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{result.diet_data?.summary?.calories ?? '—'}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Protein</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{result.diet_data?.summary?.protein_g ?? '—'} g</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Carbs</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{result.diet_data?.summary?.carbs_g ?? '—'} g</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Fat</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{result.diet_data?.summary?.fat_g ?? '—'} g</div>
                </div>
              </div>
              {Array.isArray(result.diet_data?.days) && result.diet_data?.days?.length ? (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Day 1 preview</div>
                  <div className="mt-3 text-sm font-semibold text-slate-900">
                    {result.diet_data.days[0]?.label || `Day ${result.diet_data.days[0]?.day}`}
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {(result.diet_data.days[0]?.meals || []).map((meal: any, index: number) => (
                      <div key={`${meal.type}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{meal.type}</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">{meal.title}</div>
                        <ul className="mt-2 text-xs text-slate-500">
                          {(meal.portions || []).map((portion: any, idx: number) => (
                            <li key={idx}>{portion.item}: {portion.qty}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Raw JSON</div>
                <div className="mt-3">
                  <JsonBlock data={result} />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No diet generated yet.</p>
          )}
        </section>
      </AppShell>
    </AuthGate>
  );
}
