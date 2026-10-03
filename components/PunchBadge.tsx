export default function PunchBadge({ tipo }: { tipo: 50 | 100 }) {
  const cor = tipo === 50 ? "border-steel text-steel" : "border-stamp text-stamp";
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed font-display font-bold text-[11px] rotate-[-4deg] ${cor}`}
      title={tipo === 50 ? "Dia útil (50%)" : "Domingo/Feriado (100%)"}
    >
      {tipo}%
    </span>
  );
}
