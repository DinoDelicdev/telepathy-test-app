"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

// --- CHANGE 1: Define the type for a single game type for cleaner state typing ---
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
  { key: "custom_words", color: "bg-blue-200", text: "FOX", title: "CUSTOM WORDS", desc: "Make your own set" },
  { key: "random_numbers", color: "bg-blue-200", text: "567", title: "RANDOM NUMBERS", desc: "Most difficult" },
];

export default function Home() {
  const [roomCodeToJoin, setRoomCodeToJoin] = useState("");
  const [myInitialRoomId, setMyInitialRoomId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [playerCount, setPlayerCount] = useState(0);

  // --- CHANGE 2: Add state to manage the selected game type for the new drawer ---
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);

  useEffect(() => {
    // Generate a random ID once when the component mounts
    const randomNr = String(Math.floor(100000 + Math.random() * 900000));
    setMyInitialRoomId(randomNr);

    // Automatically connect to your own room when the page loads
    setCurrentRoomId(randomNr);
  }, []);

  // --- Effect 2: Manage the WebSocket connection ---
  // This effect runs whenever `currentRoomId` changes.
  useEffect(() => {
    if (socket) {
      socket.close();
    }

    if (!currentRoomId) return;

    // Create a new WebSocket connection to the current room
    const newSocket = new WebSocket(`ws://localhost:8081/${currentRoomId}`);

    newSocket.onopen = () => {
      console.log(`✅ WebSocket connection opened for room: ${currentRoomId}`);
    };

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "ROOM_UPDATE") {
        console.log(`❗️ ROOM UPDATE: Players in room ${currentRoomId}: ${message.count}`);
        setPlayerCount(message.count);
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    newSocket.onclose = () => {
      console.log(`🔌 WebSocket connection closed for room: ${currentRoomId}`);
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [currentRoomId]);

  const handleGoToMyRoom = () => {
    console.log("Switching back to my original room:", myInitialRoomId);
    setCurrentRoomId(myInitialRoomId);
  };

  const handleJoinFriendRoom = () => {
    if (roomCodeToJoin.length < 6) {
      alert("Room code must be 6 digits.");
      return;
    }
    console.log(`Attempting to join friend's room: ${roomCodeToJoin}`);
    setCurrentRoomId(roomCodeToJoin);
  };

  const linePathRef = useRef<SVGPathElement>(null);

  return (
    <main className="min-h-screen flex flex-col bg-amber-50 px-4 py-12 items-center gap-4">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold">Telepathy</h1>
        <p className="text-muted-foreground">A simple game of mind-reading.</p>
      </div>

      <Image src="/main.png" alt="Telepathy Game" priority width={300} height={300} />

      {/* --- STATUS DISPLAY --- */}
      <Card className="w-full max-w-xs p-4 bg-white/80">
        <CardContent className="text-center p-0">
          <p>
            Your personal room code is: <span className="font-bold text-xl tracking-widest text-blue-700">{myInitialRoomId}</span>
          </p>
          <hr className="my-2" />
          {/* <p className="font-semibold">
            You are currently in room: <span className="text-green-600 font-bold text-xl tracking-wider">{currentRoomId}</span>
          </p>
          <p className="font-semibold">
            Players in this room: <span className="text-green-600 font-bold text-xl">{playerCount}</span>
          </p> */}
          {playerCount === 2 ? <p>Connected</p> : ""}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 items-center w-full max-w-xs">
        <Button onClick={handleGoToMyRoom} className="w-full">
          Go to My Room
        </Button>

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
                <DrawerDescription>Enter the 6-digit code from your friend.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0 flex flex-col items-center gap-4">
                <InputOTP pattern={REGEXP_ONLY_DIGITS} maxLength={6} value={roomCodeToJoin} onChange={(code) => setRoomCodeToJoin(code)}>
                  <InputOTPGroup>
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <DrawerClose asChild>
                  <Button onClick={handleJoinFriendRoom} className="w-full" disabled={roomCodeToJoin.length < 6}>
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

      {/* --- Game Types Browser --- */}
      <div className="w-full max-w-md mt-6">
        <h3 className="text-center font-semibold mb-3 text-lg">Available Game Modes</h3>
        <div className="flex flex-col justify-center items-center w-full gap-2">
          {gameTypes.map((type) => (
            <Card
              key={type.key}
              className="p-3 text-center bg-white/60 w-full cursor-pointer hover:bg-white/90 transition-colors"
              // --- CHANGE 3: On click, set the selected game type state ---
              onClick={() => setSelectedGameType(type)}
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

      {/* --- CHANGE 4: Add the new drawer for displaying game type details --- */}
      <Drawer
        // We control the open state programmatically based on our `selectedGameType` state
        open={!!selectedGameType}
        // When the drawer is closed (by swiping, clicking overlay, etc.), we reset the state
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedGameType(null);
          }
        }}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            {/* Only render the content if a game type is actually selected */}
            {selectedGameType && (
              <>
                <DrawerHeader className="text-center">
                  <DrawerTitle className="text-2xl">{selectedGameType.title}</DrawerTitle>
                  <DrawerDescription>{selectedGameType.desc}</DrawerDescription>
                </DrawerHeader>

                <div className="p-4 flex justify-center items-center">
                  {/* You can add more specific details here */}
                  {selectedGameType.image ? <Image className="rounded-xl" src={selectedGameType.image} width={120} height={120} alt={selectedGameType.title} /> : <div className={cn("h-[120px] w-[120px] rounded-xl flex justify-center items-center", selectedGameType.color)}>{selectedGameType.text && <p className="text-3xl text-blue-950 font-bold">{selectedGameType.text}</p>}</div>}
                </div>

                <DrawerFooter>
                  <Button onClick={() => alert(`Starting game: ${selectedGameType.title}`)}>Start Game</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
