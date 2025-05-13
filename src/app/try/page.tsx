"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const roomId = "room123";
  const [lastButton, setLastButton] = useState<number | null>(null);

  // Connect to SSE
  useEffect(() => {
    const es = new EventSource(`api/sse?room=${roomId}`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastButton(data.button);
    };
    return () => es.close();
  }, []);

  const sendClick = async (button: number) => {
    await fetch("api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, button }),
    });
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Room: {roomId}</h1>
      <div>
        {[1, 2, 3, 4].map((num) => (
          <button key={num} onClick={() => sendClick(num)} style={{ marginRight: 10, padding: 10 }}>
            Button {num}
          </button>
        ))}
      </div>
      <h2 style={{ marginTop: 20 }}>Last button clicked: {lastButton ?? "None yet"}</h2>
    </main>
  );
}
