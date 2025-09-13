"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Send, Ear } from "lucide-react";
import { cn } from "@/lib/utils";
import "./home.css";

type GameType = {
  key: string;
  image?: string;
  color?: string;
  text?: string;
  title: string;
  desc: string;
};
const gameTypes: GameType[] = [
  { key: "emotions", image: "/dog.png", title: "EMOTIONS", desc: "Guess the right character" },
  { key: "places", image: "/places.png", title: "PLACES", desc: "Pick the right place" },
  { key: "colors", color: "bg-pink-300", title: "COLORS", desc: "Pick the right color" },
  { key: "random_words", color: "bg-blue-200", text: "FOX", title: "RANDOM WORDS", desc: "Guess the random word" },
  { key: "numbers", color: "bg-green-200", text: "42", title: "NUMBERS", desc: "Guess the secret number" },
];

export default function Home() {
  const router = useRouter();
  const [myInitialRoomId, setMyInitialRoomId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [selectedRole, setSelectedRole] = useState<"sender" | "receiver" | null>(null);
  const [roomCodeToJoin, setRoomCodeToJoin] = useState("");
  const [isGameSelectionOpen, setIsGameSelectionOpen] = useState(false);
  const pendingActionRef = useRef<any | null>(null);

  useEffect(() => {
    const randomNr = String(Math.floor(100000 + Math.random() * 900000));
    setMyInitialRoomId(randomNr);
    setCurrentRoomId(randomNr);
  }, []);

  useEffect(() => {
    if (socket) socket.close();
    if (!currentRoomId) return;
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || `ws://localhost:8081`;
    const newSocket = new WebSocket(`${wsUrl}/${currentRoomId}`);
    newSocket.onopen = () => {
      newSocket.send(JSON.stringify({ type: "IDENTIFY_LOBBY" }));
      if (pendingActionRef.current) {
        newSocket.send(JSON.stringify(pendingActionRef.current));
        pendingActionRef.current = null;
      }
    };
    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "ROOM_UPDATE") setPlayerCount(message.count);
      if (message.type === "GAME_STARTED") {
        const { roomId, gameType, role, playerId } = message.payload;
        router.push(`/game/${roomId}?gameType=${gameType}&role=${role}&playerId=${playerId}`);
      }
    };
    setSocket(newSocket);
    return () => newSocket.close();
  }, [currentRoomId, router]);

  const handleSimpleJoin = () => {
    if (roomCodeToJoin.length < 6) return;
    setCurrentRoomId(roomCodeToJoin);
  };

  const handleStartGame = () => {
    if (!socket || !selectedGameType || !selectedRole) return;
    socket.send(JSON.stringify({ type: "START_GAME", payload: { gameType: selectedGameType.key, role: selectedRole } }));
    setIsGameSelectionOpen(false);
  };

  const handleJoinAndInitiate = () => {
    if (roomCodeToJoin.length < 6 || !selectedGameType || !selectedRole) return;
    pendingActionRef.current = { type: "START_GAME", payload: { gameType: selectedGameType.key, role: selectedRole } };
    setCurrentRoomId(roomCodeToJoin);
    setIsGameSelectionOpen(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-amber-50 px-4 py-12 items-center gap-4">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold">Telepathy</h1>
        <p className="text-muted-foreground">A simple game of mind-reading.</p>
      </div>

      <div className="relative w-[300px] h-[300px]">
        <Image src="/main.png" alt="Telepathy Game" priority width={300} height={300} />
        <svg className="telepathy-line" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* The updated path is below */}
          <path d="M100 70 A100 80 0 0 1 200 70" stroke="black" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
        </svg>
      </div>

      <Card className="w-full max-w-xs p-4 bg-white/80">
        <CardContent className="text-center p-0">
          <p>
            Your Personal Room Code is: <span className="font-bold text-xl tracking-widest text-blue-700">{myInitialRoomId}</span>
          </p>
          <hr className="my-2" />
          <p className="font-semibold">
            Players in current room ({currentRoomId}): <span className="text-green-600 font-bold text-xl">{playerCount}</span>
          </p>
        </CardContent>
      </Card>

      {/* --- THIS IS THE RESTORED BUTTON AND DRAWER --- */}
      <div className="flex flex-col gap-2 items-center w-full max-w-xs">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" className="w-full">
              Join a Friend's Room
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Join Room</DrawerTitle>
                <DrawerDescription>Enter the 6-digit code to join a friend's lobby.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 flex flex-col items-center gap-4">
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={roomCodeToJoin} onChange={setRoomCodeToJoin}>
                  <InputOTPGroup>
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <DrawerClose asChild>
                  <Button onClick={handleSimpleJoin} className="w-full" disabled={roomCodeToJoin.length < 6}>
                    Proceed To Friend's Room
                  </Button>
                </DrawerClose>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="w-full max-w-md mt-6">
        <h3 className="text-center font-semibold mb-3 text-lg">Available Game Modes</h3>
        <div className="flex flex-col justify-center items-center w-full gap-2">
          {gameTypes.map((type) => (
            <Card
              key={type.key}
              className="p-3 text-center bg-white/60 w-full cursor-pointer hover:bg-white/90 transition-colors"
              onClick={() => {
                setSelectedGameType(type);
                setSelectedRole(null);
                setRoomCodeToJoin("");
                setIsGameSelectionOpen(true);
              }}
            >
              <CardContent className="w-full flex items-center justify-between gap-2 px-8 py-0">
                {type.image ? <Image className="rounded-lg" src={type.image} width={60} height={60} alt={type.title} /> : <div className={cn("h-[60px] w-[60px] rounded-lg flex justify-center items-center", type.color)}>{type.text && <p className="text-lg text-blue-950 font-bold">{type.text}</p>}</div>}
                <div className="mt-1 text-left flex-1">
                  <p className="font-bold text-sm leading-tight">{type.title}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Drawer
        open={isGameSelectionOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedGameType(null);
            setIsGameSelectionOpen(false);
          }
        }}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            {selectedGameType &&
              (playerCount < 2 && currentRoomId === myInitialRoomId ? (
                <>
                  <DrawerHeader>
                    <DrawerTitle>{selectedGameType.title}</DrawerTitle>
                    <DrawerDescription>Select a role, then enter your friend's code to join and start.</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 flex flex-col gap-4">
                    <ToggleGroup
                      type="single"
                      value={selectedRole || ""}
                      onValueChange={(role) => {
                        if (role) setSelectedRole(role as "sender" | "receiver");
                      }}
                      className="grid grid-cols-2 gap-2"
                    >
                      <ToggleGroupItem value="sender" aria-label="Select Sender" className="h-12 text-base flex gap-2">
                        <Send size={18} /> Sender
                      </ToggleGroupItem>
                      <ToggleGroupItem value="receiver" aria-label="Select Receiver" className="h-12 text-base flex gap-2">
                        <Ear size={18} /> Receiver
                      </ToggleGroupItem>
                    </ToggleGroup>
                    {selectedRole && (
                      <div className="flex flex-col items-center gap-2 pt-4 border-t">
                        <p className="text-sm font-medium">Enter Friend's Code:</p>
                        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={roomCodeToJoin} onChange={setRoomCodeToJoin}>
                          <InputOTPGroup>
                            {[...Array(6)].map((_, i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                        <Button onClick={handleJoinAndInitiate} className="w-full mt-2" disabled={roomCodeToJoin.length < 6}>
                          Join & Start
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <DrawerHeader>
                    <DrawerTitle>{selectedGameType.title}</DrawerTitle>
                    <DrawerDescription>You're connected! Select a role and start the game.</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 flex flex-col gap-4">
                    <ToggleGroup
                      type="single"
                      value={selectedRole || ""}
                      onValueChange={(role) => {
                        if (role) setSelectedRole(role as "sender" | "receiver");
                      }}
                      className="grid grid-cols-2 gap-2"
                    >
                      <ToggleGroupItem value="sender" aria-label="Select Sender" className="h-12 text-base flex gap-2">
                        <Send size={18} /> Sender
                      </ToggleGroupItem>
                      <ToggleGroupItem value="receiver" aria-label="Select Receiver" className="h-12 text-base flex gap-2">
                        <Ear size={18} /> Receiver
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <Button onClick={handleStartGame} className="w-full mt-4" disabled={!selectedRole}>
                      Start Game
                    </Button>
                  </div>
                </>
              ))}
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
