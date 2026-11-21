import React from "react";

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className={`fixed left-1/2 bottom-8 -translate-x-1/2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl z-50 flex items-center gap-2 transition-all ${
        message.isError
          ? "bg-rose-950 text-rose-200 border border-rose-500"
          : "bg-[#0a1b2a] text-white border border-[#479ece]"
      }`}
    >
      <span>{message.text}</span>
    </div>
  );
}