"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <main style={{ padding: 40 }}>
      <h1>Enter a Room ID</h1>
      <input type="text" placeholder="room123" value={roomId} onChange={(e) => setRoomId(e.target.value)} style={{ marginRight: 10 }} />
      <button onClick={() => router.push(`/sender/${roomId}`)}>Sender</button>
      <button onClick={() => router.push(`/receiver/${roomId}`)} style={{ marginLeft: 10 }}>
        Receiver
      </button>
    </main>
  );
}
