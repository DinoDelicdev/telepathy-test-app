"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RoundResult = { result: "Correct" | "Wrong"; pickedItem: string; correctItem: string; };

export default function GamePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const socketRef = useRef<WebSocket | null>(null);
    const [gameStatus, setGameStatus] = useState("Connecting...");
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [senderItem, setSenderItem] = useState<string | null>(null);
    const [receiverOptions, setReceiverOptions] = useState<string[]>([]);
    const [canReceiverGuess, setCanReceiverGuess] = useState(false);
    const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    const gameId = useMemo(() => params.gameId as string, [params.gameId]);
    const myRole = useMemo(() => searchParams.get("role") as "sender" | "receiver", [searchParams]);
    const playerId = useMemo(() => searchParams.get("playerId"), [searchParams]);
    const gameType = useMemo(() => searchParams.get("gameType") || "colors", [searchParams]);
    const gameTitle = useMemo(() => gameType.replace("_", " ").toUpperCase(), [gameType]);

    useEffect(() => {
        if (!gameId || !playerId) return;
        const socket = new WebSocket(`ws://localhost:8081/${gameId}`);
        socketRef.current = socket;
        socket.onopen = () => {
            setGameStatus("Waiting for other player...");
            socket.send(JSON.stringify({ type: "PLAYER_READY", payload: { playerId } }));
        };
        socket.onmessage = (event) => {
            const { type, payload } = JSON.parse(event.data);
            const currentRole = searchParams.get("role");
            switch (type) {
                case "NEW_ROUND":
                    setGameStatus(`Round ${payload.round}`);
                    setRound(payload.round);
                    setScore(payload.score);
                    setRoundResult(null);
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
        socket.onclose = () => { setIsGameOver(prev => { if (!prev) setGameStatus("Connection lost."); return true; }); };
        socket.onerror = () => { setGameStatus("Connection Error!"); };
        return () => { socket.close(); };
    }, [gameId, playerId, searchParams]);

    useEffect(() => {
        if (roundResult && !isGameOver) {
            const timer = setTimeout(() => {
                socketRef.current?.send(JSON.stringify({ type: "REQUEST_NEXT_ROUND" }));
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [roundResult, isGameOver]);

    const handleReceiverGuess = (item: string) => {
        if (!canReceiverGuess || !socketRef.current) return;
        setCanReceiverGuess(false);
        socketRef.current.send(JSON.stringify({ type: "SUBMIT_GUESS", payload: { item } }));
    };

    // --- MODIFIED: GameItem component now handles rendering text ---
    const GameItem = ({ item, isBig = false, isCorrect = false }: { item: string; isBig?: boolean; isCorrect?: boolean }) => {
        const altText = item.split('.')[0];
        const isTextBased = gameType === 'numbers' || gameType === 'random_words';

        if (gameType === 'emotions') {
            return <Image src={`/${item}`} alt={altText} width={isBig ? 256 : 128} height={isBig ? 256 : 128} className={cn("rounded-xl object-cover", isBig && "shadow-lg border-4 border-white", isCorrect && "border-4 border-yellow-400")} />
        }
        
        return (
            <div
                className={cn(
                    isBig ? "w-64 h-64" : "w-full h-full", // Receiver options fill their container
                    "rounded-lg mx-auto flex items-center justify-center p-2",
                    isCorrect ? "border-4 border-yellow-400" : (isBig ? "border-4 border-white" : ""),
                    isTextBased ? "bg-white/80" : ""
                )}
                style={{ backgroundColor: gameType === 'colors' ? item : undefined }}
            >
                {isTextBased && <span className={cn("font-bold text-center", isBig ? "text-6xl" : "text-3xl")}>{item}</span>}
            </div>
        )
    };

    const renderContent = () => {
        if (isGameOver) {
            return (
                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">{gameStatus}</h2>
                    <p className="text-2xl">Your final score is:</p>
                    <p className="text-6xl font-bold my-4">{finalScore} / 10</p>
                    <Button onClick={() => window.location.href = '/'}>Play Again</Button>
                </div>
            );
        }
        
        if (roundResult) {
            return (
                <div className="text-center w-full max-w-md animate-pulse">
                    {roundResult.result === 'Correct' ? <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /> : <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />}
                    <h2 className="text-4xl font-bold mb-4">{roundResult.result}!</h2>
                    {myRole === 'receiver' ? <p>You picked:</p> : <p>Your partner picked:</p>}
                    <div className={cn(gameType === 'emotions' ? "w-32 h-32" : "w-24 h-24", "mx-auto")}><GameItem item={roundResult.pickedItem} /></div>
                    
                    {roundResult.result === 'Wrong' && (
                        <>
                            <p className="mt-4">The correct item was:</p>
                             <div className={cn(gameType === 'emotions' ? "w-32 h-32" : "w-24 h-24", "mx-auto")}><GameItem item={roundResult.correctItem} isCorrect /></div>
                        </>
                    )}
                </div>
            );
        }

        if (myRole === "sender") {
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Transmit this item:</h2>
                    <p className="text-muted-foreground mb-4">Focus and send this to your partner with your mind.</p>
                    {senderItem ? <GameItem item={senderItem} isBig /> : <div className="w-64 h-64 rounded-xl bg-gray-200 animate-pulse"></div>}
                </div>
            );
        }

        if (myRole === "receiver") {
            return (
                <div className="text-center w-full max-w-md">
                    <h2 className="text-2xl font-semibold mb-2">Receive the item:</h2>
                    <p className="text-muted-foreground mb-4">Which item is your partner thinking of?</p>
                    <div className="grid grid-cols-2 gap-4">
                        {receiverOptions.length > 0 ? receiverOptions.map((item) => (
                            <div key={item} role="button" tabIndex={0}
                                onClick={() => handleReceiverGuess(item)}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleReceiverGuess(item)}
                                className={cn("h-32 flex justify-center items-center rounded-lg shadow-lg border-4 border-transparent transition-transform duration-200",
                                    canReceiverGuess && "hover:scale-105 hover:border-yellow-400 cursor-pointer",
                                    !canReceiverGuess && "opacity-50 pointer-events-none"
                                )}
                            >
                               <GameItem item={item} />
                            </div>
                        )) : Array(4).fill(0).map((_, i) => <div key={i} className="h-32 rounded-lg bg-gray-200 animate-pulse"></div>)}
                    </div>
                </div>
            );
        }
        return <p>Loading game...</p>;
    };

    return (
        <main className="min-h-screen flex flex-col bg-sky-100 p-4">
            <header className="w-full max-w-4xl mx-auto">
                <Card>
                    <CardContent className="flex justify-between items-center p-4">
                        <div className="text-left"><h1 className="font-bold text-xl">{gameTitle}</h1><p className="text-sm text-muted-foreground capitalize">Role: {myRole}</p></div>
                        <div className="text-center"><p className="font-semibold text-lg">{gameStatus}</p></div>
                        <div className="text-right"><p className="font-bold text-xl">Score: {score}</p><p className="text-sm text-muted-foreground">Round: {round > 10 ? 10 : round} / 10</p></div>
                    </CardContent>
                </Card>
            </header>
            <div className="flex-grow flex items-center justify-center">{renderContent()}</div>
        </main>
    );
}