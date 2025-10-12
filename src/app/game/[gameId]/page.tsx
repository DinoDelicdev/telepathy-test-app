"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";

import { CheckCircle, XCircle, Link, Link2Off, Check, X, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type RoundResult = { result: "Correct" | "Wrong"; pickedItem: string; correctItem: string };

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const socketRef = useRef<WebSocket | null>(null);
  const [gameStatus, setGameStatus] = useState("Connecting...");
  const [isConnected, setIsConnected] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [senderItem, setSenderItem] = useState<string | null>(null);
  const [receiverOptions, setReceiverOptions] = useState<string[]>([]);
  const [canReceiverGuess, setCanReceiverGuess] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const gameId = useMemo(() => params.gameId as string, [params.gameId]);
  const myRole = useMemo(() => searchParams.get("role") as "sender" | "receiver", [searchParams]);
  const playerId = useMemo(() => searchParams.get("playerId"), [searchParams]);
  const gameType = useMemo(() => searchParams.get("gameType") || "colors", [searchParams]);

  useEffect(() => {
    if (!gameId || !playerId) return;
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || `ws://localhost:8081`;
    const socket = new WebSocket(`${wsUrl}/${gameId}`);
    socketRef.current = socket;
    socket.onopen = () => {
      setGameStatus("Waiting for other player...");
      setIsConnected(true);
      socket.send(JSON.stringify({ type: "PLAYER_READY", payload: { playerId } }));
    };
    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      const currentRole = searchParams.get("role");
      switch (type) {
        case "NEW_ROUND":
          setGameStatus("");
          setRound(payload.round);
          setScore(payload.score);
          setRoundResult(null);
          setCountdown(null);
          if (currentRole === "sender" && payload.sender) setSenderItem(payload.sender.correctItem);
          if (currentRole === "receiver" && payload.receiver) {
            setReceiverOptions(payload.receiver.options);
            setCanReceiverGuess(true);
          }
          break;
        case "GUESS_RESULT":
          setRoundResult(payload);
          setScore(payload.score);
          setCanReceiverGuess(false);
          break;
        case "GAME_OVER":
          setIsGameOver(true);
          setFinalScore(payload.finalScore);
          setGameStatus("Game Over!");
          break;
        case "PLAYER_DISCONNECTED":
          setIsGameOver(true);
          setGameStatus("Other player disconnected.");
          break;
      }
    };
    socket.onclose = () => {
      setIsConnected(false);
      setIsGameOver((prev) => {
        if (!prev) setGameStatus("Connection lost.");
        return true;
      });
    };
    socket.onerror = () => {
      setIsConnected(false);
      setGameStatus("Connection Error!");
    };
    return () => {
      socket.close();
    };
  }, [gameId, playerId, searchParams]);

  useEffect(() => {
    if (roundResult && !isGameOver) {
      setCountdown(3);

      const interval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === null || prevCountdown <= 1) {
            clearInterval(interval);
            socketRef.current?.send(JSON.stringify({ type: "REQUEST_NEXT_ROUND" }));
            return null;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [roundResult, isGameOver]);

  const handleReceiverGuess = (item: string) => {
    if (!canReceiverGuess || !socketRef.current) return;
    setCanReceiverGuess(false);
    socketRef.current.send(JSON.stringify({ type: "SUBMIT_GUESS", payload: { item } }));
  };

  const GameItem = ({ item, isBig = false, isCorrect = false }: { item: string; isBig?: boolean; isCorrect?: boolean }) => {
    const altText = item.split(".")[0];
    const isTextBased = gameType === "numbers" || gameType === "random_words";

    // --- THIS IS THE ONLY PART THAT IS FIXED ---
    if (gameType === "emotions") {
      return (
        <Image
          src={`/${item}`}
          alt={altText}
          width={500} // Provide a base intrinsic width (Next.js needs this)
          height={500} // Provide a base intrinsic height
          className={cn(
            // These classes control the ACTUAL displayed size and behavior
            "w-full h-full object-contain",
            isBig && "shadow-lg border-4 border-white rounded-xl",
            isCorrect && "border-4 border-yellow-400"
          )}
        />
      );
    }

    return (
      <div className={cn(isBig ? "w-64 h-64" : "w-full h-full", "rounded-lg mx-auto flex items-center justify-center p-2", isCorrect ? "border-4 border-yellow-400" : isBig ? "border-4 border-white" : "", isTextBased ? "bg-white/80" : "")} style={{ backgroundColor: gameType === "colors" ? item : undefined }}>
        {isTextBased && <span className={cn("font-bold text-center", isBig ? "text-6xl" : "text-3xl")}>{item}</span>}
      </div>
    );
  };

  const ResultIndicator = ({ result }: { result: "Correct" | "Wrong" }) => (
    <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-full flex justify-center items-center gap-2 animate-bounce">
      {result === "Correct" ? <CheckCircle className="w-8 h-8 text-green-500" /> : <XCircle className="w-8 h-8 text-red-500" />}
      <h2 className={`text-3xl font-bold ${result === "Correct" ? "text-green-600" : "text-red-600"}`}>{result}!</h2>
    </div>
  );

  const CountdownTimer = ({ count }: { count: number | null }) => (
    <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-full flex justify-center items-center gap-2 text-muted-foreground">
      <Timer className="w-5 h-5" />
      <p className="text-lg font-medium">Next round in {count}...</p>
    </div>
  );

  const renderContent = () => {
    if (isGameOver) {
      return (
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">{gameStatus}</h2>
          <p className="text-2xl">Your final score is:</p>
          <p className="text-6xl font-bold my-4">{finalScore} / 10</p>
          <Button onClick={() => (window.location.href = "/")}>Play Again</Button>
        </div>
      );
    }

    if (myRole === "sender") {
      return (
        <div className="relative text-center flex flex-col items-center">
          {roundResult && <ResultIndicator result={roundResult.result} />}
          <h2 className="text-2xl font-semibold mb-2">Transmit this item:</h2>
          <p className="text-muted-foreground mb-4">Focus and send this to your partner with your mind.</p>
          {/* The container below defines the space (256x256) */}
          <div className="w-64 h-64 flex items-center justify-center">{senderItem ? <GameItem item={senderItem} isBig /> : <div className="w-64 h-64 rounded-xl bg-gray-200 animate-pulse"></div>}</div>
          {roundResult && countdown && <CountdownTimer count={countdown} />}
        </div>
      );
    }

    if (myRole === "receiver") {
      return (
        <div className="relative text-center w-full max-w-md">
          {roundResult && <ResultIndicator result={roundResult.result} />}
          <h2 className="text-2xl font-semibold mb-2">Receive the item:</h2>
          <p className="text-muted-foreground mb-4">Which item is your partner thinking of?</p>
          <div className="grid grid-cols-2 gap-4">
            {receiverOptions.length > 0
              ? receiverOptions.map((item) => (
                  // This container defines the space (128px high)
                  <div key={item} role="button" tabIndex={0} onClick={() => handleReceiverGuess(item)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleReceiverGuess(item)} className={cn("h-32 p-2 flex justify-center items-center rounded-lg shadow-lg border-4 border-transparent transition-transform duration-200", canReceiverGuess && "hover:scale-105 hover:border-yellow-400 cursor-pointer", !canReceiverGuess && "opacity-50 pointer-events-none")}>
                    <GameItem item={item} />
                  </div>
                ))
              : Array(4)
                  .fill(0)
                  .map((_, i) => <div key={i} className="h-32 rounded-lg bg-gray-200 animate-pulse"></div>)}
          </div>
          {roundResult && countdown && <CountdownTimer count={countdown} />}
        </div>
      );
    }

    return <p className="font-semibold text-lg animate-pulse">{gameStatus}</p>;
  };

  const ConnectionStatus = () => {
    /* ... (Unchanged) ... */
    if (isConnected) {
      return (
        <div className="flex items-center justify-center gap-2 text-white bg-black px-2 rounded-3xl">
          <Link size={16} />
          <div className="w-[50%] rounded-4xl h-[80%] flex justify-center items-center bg-green-800">
            <Check size={16} />
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center gap-2 text-white bg-black px-2 rounded-3xl">
        <Link2Off size={16} />
        <div className="w-[50%] rounded-4xl h-[80%] flex justify-center items-center bg-red-800">
          <X size={16} />
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-amber-50 p-4">
      <header className="w-full max-w-2xl mx-auto flex flex-col items-center gap-1 mb-8">
        <div className="text-left w-1/4"></div>
        <div className="flex justify-between gap-1.5 mb-1 w-[100%]">
          <div>
            <span className="text-sm font-bold text-primary">{Math.min(round, 10)} / 10</span>
          </div>
          <ConnectionStatus />
        </div>
        <Progress value={round * 10} className="w-full" />
      </header>
      <div className="flex-grow flex items-center justify-center py-16">{renderContent()}</div>
    </main>
  );
}
