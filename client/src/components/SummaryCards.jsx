export const SummaryCards = ({ summary }) => {
  const cards = [
    ["Projects", summary?.projects ?? 0, "bg-indigo-500"],
    ["Tasks", summary.total, "bg-sky-500"],
    ["In Progress", summary.inProgress, "bg-amber-500"],
    ["Overdue", summary.overdue, "bg-rose-500"],
  ];

  return (
    <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value, accentClass]) => (
        <article key={label} className="card card-hover">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full ${accentClass}`}
              style={{ width: `${Math.min(100, Number(value) * 10)}%` }}
            />
          </div>
        </article>
      ))}
    </section>
  );
};
