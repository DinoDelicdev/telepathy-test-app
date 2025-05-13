"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Receiver() {
  const { roomId } = useParams();
  const [lastButton, setLastButton] = useState<number | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/sse?room=${roomId}`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastButton(data.button);
    };
    return () => es.close();
  }, [roomId]);

  return (
    <main style={{ padding: 40 }}>
      <h1>Receiver Room: {roomId}</h1>
      <h2>Last button received: {lastButton ?? "None yet"}</h2>
    </main>
  );
}
