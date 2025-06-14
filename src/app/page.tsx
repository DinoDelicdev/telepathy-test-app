// src/app/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

// Array of game types for Browse
const gameTypes = [
  {
    key: "emotions",
    image: "/dog.png",
    title: "EMOTIONS",
    desc: "Guess the right character",
  },
  {
    key: "places",
    image: "/places.png",
    title: "PLACES",
    desc: "Pick the right place",
  },
  {
    key: "colors",
    color: "bg-pink-300",
    title: "COLORS",
    desc: "Pick the right color",
  },
  {
    key: "random_words",
    color: "bg-blue-200",
    text: "FOX",
    title: "RANDOM WORDS",
    desc: "Guess the random word",
  },
  {
    key: "custom_words",
    color: "bg-blue-200",
    text: "FOX",
    title: "CUSTOM WORDS",
    desc: "Mack your own set",
  },
  {
    key: "random_numbers",
    color: "bg-blue-200",
    text: "567",
    title: "RANDOM NUMBERS",
    desc: "Most difficult",
  },
];

export default function Home() {
  const router = useRouter();
  const [roomNumber, setRoomNumber] = useState<number | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const linePathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    let randomNr = 0;
    while (randomNr < 100000) {
      randomNr = Math.floor(Math.random() * 1000000);
    }
    setRoomNumber(randomNr);
    localStorage.setItem("usersRoomId", String(randomNr));

    if (linePathRef.current) {
      setPathLength(linePathRef.current.getTotalLength());
    }
  }, []);

  const handleCreateRoom = () => {
    router.push(`/${roomNumber}`);
  };

  const handleJoinRoom = () => {
    if (roomCode.length < 6) {
      alert("Room code must be 6 digits.");
    } else {
      router.push(`/${roomCode}`);
    }
  };

  return (
    // --- CHANGE IS ON THIS LINE ---
    <main className="min-h-screen flex flex-col bg-amber-50 px-4 py-12 items-center gap-4">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold">Telepathy</h1>
        <p className="text-muted-foreground">A simple game of mind-reading.</p>
      </div>

      <div className="flex justify-center relative w-full max-w-sm">
        <Image src="/main.png" alt="Telepathy Game" priority width={500} height={500} />
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 500 500" overflow="visible">
          <path
            ref={linePathRef}
            d="M 110 150 C 180 10, 220 10, 380 150"
            fill="transparent"
            stroke="purple"
            strokeWidth="4"
            strokeDasharray="10 10"
            style={{
              strokeDashoffset: pathLength,
              animation: `drawTelepathyLine 10s linear infinite`,
            }}
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2 items-center w-full max-w-xs">
        <p className="text-center">
          Your room code is: <span className="font-bold text-xl tracking-widest">{roomNumber}</span>
        </p>
        <Button onClick={handleCreateRoom} className="w-full">
          Create a Room
        </Button>

        {/* --- Drawer for Joining a Room --- */}
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
                <InputOTP pattern={REGEXP_ONLY_DIGITS} maxLength={6} value={roomCode} onChange={(code) => setRoomCode(code)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button onClick={handleJoinRoom} className="w-full" disabled={roomCode.length < 6}>
                  Proceed To Friend's Room
                </Button>
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
            <Card key={type.key} className="p-3 text-center bg-white/60 w-full">
              <CardContent className="w-full flex items-center justify-between gap-2 px-8">
                {type.image ? <Image className="rounded-lg" src={type.image} width={60} height={60} alt={type.title} /> : <div className={cn("h-[60px] w-[60px] rounded-lg flex justify-center items-center", type.color)}>{type.text && <p className="text-lg text-blue-950 font-bold">{type.text}</p>}</div>}
                <div className="mt-1">
                  <p className="font-bold text-sm leading-tight">{type.title}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
