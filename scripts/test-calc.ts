import { computeEntryHours, decimalToHHMM } from "../lib/calc";

function caso(nome: string, entry: Parameters<typeof computeEntryHours>[0]) {
  const r = computeEntryHours(entry);
  console.log(
    `${nome.padEnd(38)} he50=${decimalToHHMM(r.he50)} he70=${decimalToHHMM(r.he70)} he100=${decimalToHHMM(
      r.he100
    )} he120=${decimalToHHMM(r.he120)}`
  );
}

console.log("== Casos originais da planilha (o TOTAL de horas se mantém; a divisão");
console.log("   entre 50%/70% pode mudar quando a pausa cai depois da meia-noite —");
console.log("   ver explicação abaixo) ==");
caso("Row4 (20:49-06:01, pausa 00:01-00:36)", {
  tipo: 50,
  entrada: "20:49",
  saida: "06:01",
  inicioPl: "00:01",
  finalPl: "00:36",
});
caso("Row5 (19:11-06:32, pausa 20:00-20:31)", {
  tipo: 50,
  entrada: "19:11",
  saida: "06:32",
  inicioPl: "20:00",
  finalPl: "20:31",
});
caso("Row6 (18:00-06:00, pausa 20:00-20:31)", {
  tipo: 100,
  entrada: "18:00",
  saida: "06:00",
  inicioPl: "20:00",
  finalPl: "20:31",
});

console.log("\n== Casos novos (deviam falhar antes da correção) ==");
caso("Turno 24h exatas (06:00-06:00)", { tipo: 50, entrada: "06:00", saida: "06:00", inicioPl: "", finalPl: "" });
caso("Só diurno (08:00-17:00)", { tipo: 50, entrada: "08:00", saida: "17:00", inicioPl: "12:00", finalPl: "13:00" });
caso("Começa depois das 22h (23:00-05:00)", { tipo: 100, entrada: "23:00", saida: "05:00", inicioPl: "", finalPl: "" });
caso("24h com pausa de madrugada (06:00-06:00, pausa 02:00-02:30)", {
  tipo: 50,
  entrada: "06:00",
  saida: "06:00",
  inicioPl: "02:00",
  finalPl: "02:30",
});
