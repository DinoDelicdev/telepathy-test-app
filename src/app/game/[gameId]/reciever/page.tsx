"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const effectRan = useRef(false);

  // Details from URL
  const roomId = params.gameId as string;
  const initialGameType = searchParams.get("gameType");
  const initialRole = searchParams.get("role");
  const action = searchParams.get("action");

  // State
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [confirmedGame, setConfirmedGame] = useState<{ gameType: string; role: string } | null>(null);

  useEffect(() => {
    if (effectRan.current === true) {
      if (!roomId) return;
      const newSocket = new WebSocket(`ws://localhost:8081/${roomId}`);

      newSocket.onopen = () => {
        console.log(`✅ Game Page WebSocket connected to room: ${roomId}`);
        // If the URL indicates this user is initiating, send the message
        if (action === "initiate" && initialGameType && initialRole) {
          newSocket.send(
            JSON.stringify({
              type: "JOIN_AND_INITIATE_GAME",
              payload: { gameType: initialGameType, role: initialRole },
            })
          );
        }
      };

      newSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("📢 Game Page Message:", message);
        if (message.type === "ROOM_UPDATE") setPlayerCount(message.count);
        // The server's response is the final word on the game details
        if (message.type === "GAME_STARTED") {
          setConfirmedGame(message.payload);
        }
      };

      setSocket(newSocket);
    }
    return () => {
      effectRan.current = true;
      if (socket) socket.close();
    };
  }, [roomId, action, initialGameType, initialRole, socket]);

  // WAITING SCREEN: Show this until the server confirms the game
  if (!confirmedGame) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-100">
        <h1 className="text-3xl font-bold">Connecting to Room...</h1>
        <p className="font-mono text-2xl my-4">{roomId}</p>
        <p>Players: {playerCount} / 2</p>
        <p className="mt-4 animate-pulse">Waiting for game to start...</p>
      </main>
    );
  }

  // GAME SCREEN: Shown after server confirmation
  return (
    <main className="min-h-screen flex flex-col bg-green-100 px-4 py-12 items-center justify-center gap-4 text-center">
      <Card className="p-4 w-full max-w-sm">
        <CardContent className="p-2">
          <h1 className="text-4xl font-bold">Game in Progress!</h1>
          <p className="text-sm">Room Code: {roomId}</p>
          <hr className="w-full my-4" />
          <p className="text-xl">
            Game Mode: <span className="font-bold uppercase">{confirmedGame.gameType}</span>
          </p>
          <p className="text-2xl">
            Your Role: <span className="font-bold uppercase">{confirmedGame.role}</span>
          </p>
        </CardContent>
      </Card>
      <div className="mt-6 p-8 border-2 border-dashed rounded-lg w-full max-w-sm">
        <p className="text-muted-foreground">Game Interface Placeholder</p>
      </div>
      <Button onClick={() => router.push("/")} variant="outline" className="mt-6">
        Leave Game
      </Button>
    </main>
  );
}
