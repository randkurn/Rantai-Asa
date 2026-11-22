import React from "react";
import { shortHex } from "../constants/auditData.js";

export default function TxInspectorModal({ tx, onClose }) {
  if (!tx) return null;
  const hasChainTx = /^0x[0-9a-fA-F]{64}$/.test(tx.txHash || "");

  return (
    <div className="fixed inset-0 z-50 bg-[#050f18]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a1b2a] rounded-2xl border border-[rgba(71,158,206,0.28)] max-w-xl w-full shadow-2xl overflow-hidden my-8">
        <div className="px-5 py-4 bg-[#050f18] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#479ece]/20 text-[#479ece] font-mono text-[10px] font-bold">
              ON-CHAIN AUDIT
            </span>
            <h3 className="font-heading font-bold text-sm text-white">Event Log Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9fb8c9] hover:text-white p-1 rounded-lg cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-3.5 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex justify-between items-center">
            <span className="text-[#9fb8c9]">
              Referensi: <strong>{tx.refId}</strong> ({tx.province})
            </span>
            {hasChainTx ? (
              <a
                href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#479ece] hover:underline font-semibold"
              >
                Polygonscan ↗
              </a>
            ) : (
              <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                BELUM ON-CHAIN
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#050f18] border border-[rgba(71,158,206,0.2)] font-mono text-[11px] space-y-1">
            <div className="text-[#9fb8c9]">
              Tx Hash: <span className="text-white break-all">{hasChainTx ? tx.txHash : "Belum tersedia — tercatat off-chain/database"}</span>
            </div>
            <div className="text-[#9fb8c9]">
              Identity Hash: <span className="text-[#bfe3f6] break-all">{tx.identityHash}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#9fb8c9] uppercase">Solidity Event Log:</span>
            <pre className="p-3 rounded-xl bg-[#050f18] border border-white/10 font-mono text-[10.5px] text-[#5fd7a0] overflow-x-auto leading-relaxed">
              {tx.status === "TERCATAT"
                ? `event AidDisbursed(
  bytes32 indexed identityHash = ${shortHex(tx.identityHash)},
  string  indexed programCode  = "${tx.program}",
  uint256 indexed periodId     = 202611,
  uint256 amount               = ${tx.amount},
  address officer              = ${shortHex(tx.officer)}
);`
                : `revert IdentityAlreadyRegistered(
  bytes32 identityHash = ${shortHex(tx.identityHash)},
  uint256 periodId     = 202611
);`}
            </pre>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#479ece] text-[#050f18] font-bold text-xs cursor-pointer hover:bg-[#bfe6f8]"
            >
              Tutup Inspeksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}