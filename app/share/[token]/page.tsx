import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { get } from '@/lib/api';
import { formatDate } from '@/lib/date';

export default async function SharePage({
  params
}: {
  params: { token: string };
}) {
  let data: any = null;
  let error: string | null = null;

  try {
    data = await get(`/diet-app/public/share/${params.token}`);
  } catch (err: any) {
    error = err?.message || 'Failed to load shared diet';
  }

  const profileSnapshot = data?.profile_snapshot || {};
  const profile = profileSnapshot?.profile || {};
  const location = profileSnapshot?.location || {};
  const preferences = profileSnapshot?.preferences || {};
  const summary = data?.diet_data?.summary || {};
  const days = Array.isArray(data?.diet_data?.days) ? data.diet_data.days : [];
  const notes = Array.isArray(data?.diet_data?.notes) ? data.diet_data.notes : [];

  return (
    <div>
      <Header />
      <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <Container className="py-10">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Shared diet</div>
                <h2 className="mt-2 font-display text-2xl text-slate-900">
                  {data?.title ? data.title : 'Carenexa Diet Plan'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Generated {formatDate(data?.created_at)}</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                Powered by Carenexa Diet
              </div>
            </div>
            {error && (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
                {error}
              </p>
            )}
            {!error && !data && <p className="mt-4 text-sm text-slate-500">No share data available.</p>}
          </section>

          {data && (
            <>
              <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
                <h3 className="font-display text-lg text-slate-900">Profile Snapshot</h3>
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
                </div>
              </section>

              <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
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

              <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
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

              {notes.length ? (
                <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
                  <h3 className="font-display text-lg text-slate-900">Notes</h3>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                    {notes.map((note: string, idx: number) => (
                      <li key={`${note}-${idx}`}>{note}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
                <p className="text-xs text-slate-500">
                  Disclaimer: This diet is AI-generated and intended for general wellness guidance only. Not medical advice.
                </p>
              </section>
            </>
          )}
        </Container>
      </div>
    </div>
  );
}
