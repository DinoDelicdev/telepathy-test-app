"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react"; // --- CHANGE 1: Import useRef ---
import { Card, CardContent } from "@/components/ui/card";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = params.gameId as string;
  const gameType = searchParams.get("gameType");
  const role = searchParams.get("role");

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // --- CHANGE 2: Create a ref to track if the effect has already run ---
  const effectRan = useRef(false);

  useEffect(() => {
    // --- CHANGE 3: Check the ref to prevent the effect from running twice ---
    // In development, this effect can run twice. This check ensures the connection
    // logic only executes on the second, "real" mount.
    if (effectRan.current === true) {
      if (!roomId) return;

      const newSocket = new WebSocket(`ws://localhost:8081/${roomId}`);

      newSocket.onopen = () => {
        console.log(`✅ WebSocket connected on game page for room: ${roomId}`);
        setIsConnected(true);
      };

      newSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("📢 Message received in-game:", message);
      };

      newSocket.onerror = (error) => {
        console.error("WebSocket Error on game page:", error);
      };

      newSocket.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected on game page for room: ${roomId}`);
        setIsConnected(false);
        if (!event.wasClean) {
          console.error(`Connection died unexpectedly. Code: ${event.code} Reason: ${event.reason}`);
        }
      };

      setSocket(newSocket);
    }

    // --- CHANGE 4: Set the ref to true and define the cleanup function ---
    return () => {
      // This will run on the first "unmount" in dev mode
      effectRan.current = true;
      // When the component *really* unmounts (e.g., navigating away), close the socket.
      // We check if socket exists to avoid errors.
      if (socket) {
        socket.close();
      }
    };
  }, [roomId]); // The dependency array is correct

  // ... (rest of your component remains the same)

  if (!gameType || !role) {
    return (
      <main className="min-h-screen flex flex-col bg-red-100 px-4 py-12 items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-red-700">Error: Missing Game Information</h1>
        <p>Redirecting you back to the lobby...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-green-100 px-4 py-12 items-center justify-center gap-4 text-center">
      <Card className="p-4 w-full max-w-sm">
        <CardContent className="p-2">
          <h1 className="text-4xl font-bold">Game in Progress!</h1>
          <p className="mt-2 text-lg">
            Room Code: <span className="font-mono text-green-800">{roomId}</span>
          </p>
          <p className={`text-sm font-bold ${isConnected ? "text-green-600" : "text-red-600"}`}>{isConnected ? "● Connected" : "● Connected"}</p>
          <hr className="w-full my-4" />
          <p className="text-xl">
            Game Mode: <span className="font-bold uppercase text-green-700">{gameType}</span>
          </p>
          <p className="text-2xl">
            Your Role: <span className="font-bold uppercase text-blue-700">{role}</span>
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 p-8 border-2 border-dashed border-gray-400 rounded-lg w-full max-w-sm">
        <p className="text-muted-foreground">Game Interface Placeholder</p>
      </div>

      <Button onClick={() => router.push("/")} variant="outline" className="mt-6">
        Leave Game
      </Button>
    </main>
  );
}
