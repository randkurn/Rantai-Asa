import { useEffect, useMemo, useState } from "react";
import { REGION_NAMES } from "../geoConfig.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useAuditLedger() {
  const [auditRecords, setAuditRecords] = useState([]);
  const [kpis, setKpis] = useState({
    totalRegistered: 0,
    totalDisbursed: 0,
    totalRejected: 0,
    totalSimulatedAid: 0,
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [transactionsResponse, statsResponse] = await Promise.all([
          fetch(`${API}/public/transactions`),
          fetch(`${API}/public/stats`),
        ]);
        if (!transactionsResponse.ok || !statsResponse.ok) return;
        const [transactions, stats] = await Promise.all([
          transactionsResponse.json(),
          statsResponse.json(),
        ]);
        if (!active) return;
        setAuditRecords(transactions.map((row) => ({
          timestamp: new Date(row.timestamp).toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
          }) + " WIB",
          block: 0,
          refId: row.refId,
          identityHash: row.identityHash,
          program: row.program,
          period: row.period,
          kodeWilayah: row.kodeWilayah,
          province: REGION_NAMES[row.kodeWilayah] || row.province,
          aiScore: row.aiScore,
          aiLabel: "ELIGIBLE",
          status: "TERCATAT",
          factors: [],
          amount: row.amount,
          txHash: row.txHash || "",
          officer: "",
        })));
        setKpis({
          totalRegistered: stats.totalRegistered,
          totalDisbursed: stats.totalDisbursed,
          totalRejected: 0,
          totalSimulatedAid: stats.totalAmount,
        });
      } catch (error) {
        console.error("Gagal memuat ledger publik:", error);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const addRecord = (record) => {
    setAuditRecords((prev) => [record, ...prev]);
  };

  return useMemo(() => ({
    auditRecords,
    addRecord,
    kpis,
  }), [auditRecords, kpis]);
}
