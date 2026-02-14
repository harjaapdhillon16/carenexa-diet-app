export function JsonBlock({ data }: { data: any }) {
  const text = JSON.stringify(data ?? {}, null, 2);
  return (
    <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
      <code className="bg-transparent p-0 text-inherit">{text}</code>
    </pre>
  );
}
