export function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-campus-lavender bg-white px-4 py-3.5 text-base font-medium text-campus-ink shadow-sm transition focus:border-campus-primary focus:outline-none focus:ring-4 focus:ring-campus-primary/15"
      />
    </label>
  );
}
