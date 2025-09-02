"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

// --- (GameType definition is unchanged) ---
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

  // The isJoiningToInitiate state is no longer needed here
  // const [isJoiningToInitiate, setIsJoiningToInitiate] = useState(false);

  useEffect(() => {
    const randomNr = String(Math.floor(100000 + Math.random() * 900000));
    setMyInitialRoomId(randomNr);
    setCurrentRoomId(randomNr);
  }, []);

  useEffect(() => {
    if (socket) socket.close();
    if (!currentRoomId) return;

    const newSocket = new WebSocket(`ws://localhost:8081/${currentRoomId}`);

    newSocket.onopen = () => {
      console.log(`✅ WebSocket connected to room: ${currentRoomId}`);
      // The logic for sending the initiate message is moved to the game page
    };

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "ROOM_UPDATE") setPlayerCount(message.count);
      // This is for the HOST player who waits in the lobby
      if (message.type === "GAME_STARTED") {
        const { gameType, role } = message.payload;
        router.push(`/game/${currentRoomId}?gameType=${gameType}&role=${role}`);
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
    socket.send(
      JSON.stringify({
        type: "START_GAME",
        payload: { gameType: selectedGameType.key, role: selectedRole },
      })
    );
  };

  // --- CHANGE: This function now navigates directly ---
  const handleJoinAndInitiate = () => {
    if (roomCodeToJoin.length < 6 || !selectedGameType || !selectedRole) return;
    // We add `action=initiate` to the URL to tell the game page what to do
    router.push(`/game/${roomCodeToJoin}?gameType=${selectedGameType.key}&role=${selectedRole}&action=initiate`);
  };

  // --- (The rest of the component's JSX is unchanged) ---
  return (
    <main className="min-h-screen flex flex-col bg-amber-50 px-4 py-12 items-center gap-4">
      {/* (Header, Image, Status Card, Buttons...) */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold">Telepathy</h1>
        <p className="text-muted-foreground">A simple game of mind-reading.</p>
      </div>
      <Image src="/main.png" alt="Telepathy Game" priority width={300} height={300} />

      <Card className="w-full max-w-xs p-4 bg-white/80">
        <CardContent className="text-center p-0">
          <p>
            Your Personal Room Code is: <span className="font-bold text-xl tracking-widest text-blue-700">{myInitialRoomId}</span>
          </p>
          <hr className="my-2" />
          <p className="font-semibold">
            Players in current room: <span className="text-green-600 font-bold text-xl">{playerCount}</span>
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 items-center w-full max-w-xs">
        <Button onClick={() => setCurrentRoomId(myInitialRoomId)} className="w-full">
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
        open={!!selectedGameType}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedGameType(null);
        }}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            {selectedGameType &&
              (playerCount <= 1 ? (
                // SCENARIO 1: You are ALONE
                <>
                  <DrawerHeader>
                    <DrawerTitle>{selectedGameType.title}</DrawerTitle>
                    <DrawerDescription>Select a role, then enter your friend's code to join and start.</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex gap-4 w-full">
                      <Button onClick={() => setSelectedRole("sender")} variant={selectedRole === "sender" ? "default" : "outline"}>
                        Sender
                      </Button>
                      <Button onClick={() => setSelectedRole("receiver")} variant={selectedRole === "receiver" ? "default" : "outline"}>
                        Receiver
                      </Button>
                    </div>
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
                        {/* No DrawerClose here, as it navigates away */}
                        <Button onClick={handleJoinAndInitiate} className="w-full mt-2" disabled={roomCodeToJoin.length < 6}>
                          Join & Start
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // SCENARIO 2: You are CONNECTED
                <>
                  <DrawerHeader>
                    <DrawerTitle>{selectedGameType.title}</DrawerTitle>
                    <DrawerDescription>You're connected! Select a role and start the game.</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex gap-4 w-full">
                      <Button onClick={() => setSelectedRole("sender")} variant={selectedRole === "sender" ? "default" : "outline"}>
                        Sender
                      </Button>
                      <Button onClick={() => setSelectedRole("receiver")} variant={selectedRole === "receiver" ? "default" : "outline"}>
                        Receiver
                      </Button>
                    </div>
                    <DrawerClose asChild>
                      <Button onClick={handleStartGame} className="w-full mt-4" disabled={!selectedRole}>
                        Start Game
                      </Button>
                    </DrawerClose>
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
