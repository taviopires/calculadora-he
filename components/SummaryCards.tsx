import { formatBRL, formatHoras } from "@/lib/format";
import { EntryHours } from "@/lib/types";

export default function SummaryCards({
  totals,
  valorTotalFeito,
  valorTotalDif,
}: {
  totals: EntryHours;
  valorTotalFeito: number;
  valorTotalDif: number;
}) {
  const itens: { label: string; valor: string }[] = [
    { label: "50%", valor: `${formatHoras(totals.he50)}h` },
    { label: "70%", valor: `${formatHoras(totals.he70)}h` },
    { label: "100%", valor: `${formatHoras(totals.he100)}h` },
    { label: "120%", valor: `${formatHoras(totals.he120)}h` },
  ];

  const difPositiva = valorTotalDif >= 0;

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <div className="card p-5">
        <p className="label mb-3">Total de horas extras no mês</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {itens.map((i) => (
            <div key={i.label} className="text-center border border-line rounded-md py-2">
              <p className="text-xs text-ink-faint">{i.label}</p>
              <p className="font-mono font-bold">{i.valor}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-faint mt-3">
          Valor bruto correspondente (se tudo for pago conforme calculado):{" "}
          <span className="font-mono font-semibold text-ink">{formatBRL(valorTotalFeito)}</span>
        </p>
      </div>

      <div className={`card p-5 flex flex-col justify-center ${difPositiva ? "" : "border-ledger-red/40"}`}>
        <p className="label mb-1">Diferença total apurada (holerite − devido)</p>
        <p className={`font-display font-bold text-3xl ${difPositiva ? "text-ledger-green" : "text-ledger-red"}`}>
          {formatBRL(valorTotalDif)}
        </p>
        <p className="text-xs text-ink-faint mt-2">
          {difPositiva
            ? "Positivo: o holerite cobre (ou excede) as horas extras devidas."
            : "Negativo: há horas extras devidas que não aparecem pagas no holerite."}
        </p>
      </div>
    </div>
  );
}
