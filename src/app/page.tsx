"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function Home() {
  // const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const [roomNumber, setRoomNumber] = useState(Math.floor(Math.random() * 1000000));
  const [roomCode, setRoomCode] = useState("");

  console.log(roomNumber);

  return (
    <main className="h-screen flex flex-col bg-amber-50 p-4 justify-center items-center gap-6">
      {/* <h1>Enter a Room ID</h1>
      <input type="text" placeholder="room123" value={roomId} onChange={(e) => setRoomId(e.target.value)} style={{ marginRight: 10 }} />
      <button onClick={() => router.push(`/sender/${roomId}`)}>Sender</button>
      <button onClick={() => router.push(`/receiver/${roomId}`)} style={{ marginLeft: 10 }}>
        Receiver
      </button> */}
      <h1 className="text-3xl font-bold text-center">Simple Telepathy App</h1>

      <div className="flex justify-center">
        <Image src="/main.png" alt="Description" width={500} height={500} className="" />
      </div>
      <p className="text-center">Your room code is:</p>
      <p className="text-3xl font-bold text-center">{roomNumber}</p>
      <div className="flex justify-center">
        <Button>Proceed To Your Room</Button>
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
        <Button onClick={() => console.log(roomCode)}>Proceed To Your Room</Button>
      </div>
    </main>
  );
}
