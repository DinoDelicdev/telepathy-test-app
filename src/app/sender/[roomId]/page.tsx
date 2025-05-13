"use client";

import { useParams } from "next/navigation";

export default function Sender() {
  const { roomId } = useParams();

  const sendClick = async (button: number) => {
    await fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, button }),
    });
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Sender Room: {roomId}</h1>
      {[1, 2, 3, 4].map((num) => (
        <button key={num} onClick={() => sendClick(num)} style={{ marginRight: 10, padding: 10 }}>
          Send {num}
        </button>
      ))}
    </main>
  );
}
