import { useState, useMemo } from "react";
import { REGION_NAMES } from "../geoConfig.js";
import {
  INITIAL_AUDIT_RECORDS,
  formatIDR,
  randomHex,
  getWibTimestamp,
} from "../constants/auditData.js";

const DEFAULT_OFFICER = "0xDebE39681c91F60C010d7C66e443770cf85dF3bf";

export function useAuditLedger(walletAddress, showToast) {
  const [auditRecords, setAuditRecords] = useState(INITIAL_AUDIT_RECORDS);

  const addRecord = (record) => {
    setAuditRecords((prev) => [record, ...prev]);
  };

  const simulateDisburse = () => {
    const regCodes = Object.keys(REGION_NAMES);
    const randCode = regCodes[Math.floor(Math.random() * regCodes.length)];
    const prog = Math.random() > 0.4 ? "PKH-2026-P1" : "BPNT-2026-P1";
    const amt = prog.startsWith("PKH") ? 750000 : 600000;

    addRecord({
      timestamp: getWibTimestamp(),
      block: 14892260 + auditRecords.length,
      refId: `SIM-${randCode}-0${auditRecords.length + 1}`,
      identityHash: randomHex(),
      program: prog,
      period: "P1-2026",
      kodeWilayah: parseInt(randCode),
      province: REGION_NAMES[parseInt(randCode)] || `Kab/Kota ${randCode}`,
      aiScore: 65 + Math.floor(Math.random() * 32),
      aiLabel: "ELIGIBLE",
      status: "TERCATAT",
      factors: [
        { name: "Pita Pengeluaran (Band 1)", impact: "+" },
        { name: "Kondisi Hunian Tidak Layak", impact: "+" },
        { name: "Anggota Rentan (Ada)", impact: "+" },
      ],
      amount: amt,
      txHash: randomHex(),
      officer: walletAddress || DEFAULT_OFFICER,
    });

    showToast(
      `Penyaluran ${prog} sebesar ${formatIDR(amt)} berhasil dicatat on-chain!`,
    );
  };

  const simulateDuplicate = () => {
    const existing = auditRecords[0] || INITIAL_AUDIT_RECORDS[0];

    addRecord({
      timestamp: getWibTimestamp(),
      block: 14892265 + auditRecords.length,
      refId: `DUP-${existing.kodeWilayah}-99`,
      identityHash: existing.identityHash,
      program:
        existing.program === "PKH-2026-P1" ? "BPNT-2026-P1" : "PKH-2026-P1",
      period: "P1-2026",
      kodeWilayah: existing.kodeWilayah,
      province: existing.province,
      aiScore: 0,
      aiLabel: "REJECTED",
      status: "DITOLAK_DUPLIKAT",
      factors: [
        { name: "IdentityRegistry: IdentityAlreadyRegistered()", impact: "-" },
      ],
      amount: 0,
      txHash: randomHex(),
      officer: walletAddress || DEFAULT_OFFICER,
    });

    showToast(
      "Smart contract revert: Duplikasi identitas pada periode yang sama ditolak!",
      true,
    );
  };

  const kpis = useMemo(() => {
    const valid = auditRecords.filter((r) => r.status === "TERCATAT");
    const rejectedCount = auditRecords.length - valid.length;
    return {
      totalRegistered: 1248 + valid.length,
      totalDisbursed: 1192 + valid.length,
      totalRejected: 21 + rejectedCount,
      totalSimulatedAid: valid.reduce(
        (sum, r) => sum + (r.amount || 0),
        894000000 - 4050000,
      ),
    };
  }, [auditRecords]);

  return {
    auditRecords,
    addRecord,
    simulateDisburse,
    simulateDuplicate,
    kpis,
  };
}
