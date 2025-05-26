"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function Home() {
  const router = useRouter();
  const [roomNumber, setRoomNumber] = useState<number | null>(null);
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    let randomNr = 0;
    while (randomNr < 100000) {
      randomNr = Math.floor(Math.random() * 1000000);
    }
    setRoomNumber(randomNr);
    localStorage.setItem("usersRoomId", String(randomNr));
  }, []);

  const handleProceedingToUsersRoom = () => {
    console.log(roomNumber);
    router.push(`/${roomNumber}`);
  };

  const handleProceedingToOtherPlayerRoom = () => {
    if (roomCode.length < 6) {
      console.log("Room code must have at least 6 numbers");
    } else {
      router.push(`${roomCode}`);
    }
  };

  return (
    <main className="h-screen flex flex-col bg-amber-50 p-4 justify-center items-center gap-6">
      <h1 className="text-3xl font-bold text-center">Simple Telepathy App</h1>

      <div className="flex justify-center">
        <Image src="/main.png" alt="Description" priority={false} width={500} height={500} className="" />
      </div>
      <p className="text-center">Your room code is:</p>
      <p className="text-3xl font-bold text-center">{roomNumber !== null ? roomNumber : "------"}</p>
      <div className="flex justify-center">
        <Button onClick={handleProceedingToUsersRoom}>Proceed To Your Room</Button>
      </div>
      <p className="text-center">--Or Enter Telephaty Friend Room Name--</p>
      <InputOTP pattern={REGEXP_ONLY_DIGITS} maxLength={6} value={roomCode} onChange={(roomCode) => setRoomCode(roomCode)}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <div className="flex justify-center">
        <Button onClick={handleProceedingToOtherPlayerRoom}>Proceed To Friends Room</Button>
      </div>
    </main>
  );
}
