"use client";

import { useEffect, useState, useRef } from "react"; // Import useRef
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function Home() {
  const router = useRouter();
  const [roomNumber, setRoomNumber] = useState<number | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const linePathRef = useRef<SVGPathElement>(null); // Ref for the SVG path
  const [pathLength, setPathLength] = useState(0); // State to store path length

  useEffect(() => {
    let randomNr = 0;
    while (randomNr < 100000) {
      randomNr = Math.floor(Math.random() * 1000000);
    }
    setRoomNumber(randomNr);
    localStorage.setItem("usersRoomId", String(randomNr));

    // Calculate the path length once the component mounts and the SVG is rendered
    if (linePathRef.current) {
      setPathLength(linePathRef.current.getTotalLength());
    }
  }, []); // Empty dependency array means this runs once after the initial render

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
    <main className="h-screen flex flex-col bg-amber-50 p-4 justify-center items-center gap-6 max-h-screen">
      <h1 className="text-3xl font-bold text-center">Simple Telepathy App</h1>

      <div className="flex justify-center relative">
        {/* <p className="absolute top-1 left-4">_</p> */}
        <Image src="/main.png" alt="Description" priority={false} width={500} height={500} className="" />
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 500 500" // Match Image width/height
        >
          <path
            ref={linePathRef} // Assign the ref
            id="telepathyLinePath"
            // *** IMPORTANT: Adjust these 'd' coordinates based on your image! ***
            // M = Move to (start point)
            // C = Cubic Bezier curve (control point 1, control point 2, end point)
            // Example: M(x1 y1) C(cx1 cy1, cx2 cy2, x2 y2)
            d="M 110 150 C 180 10, 220 10, 380 150"
            fill="transparent"
            stroke="purple" // Choose your line color
            strokeWidth="4" // Line thickness
            strokeDasharray="10 10" // Dash length, Gap length
            // Style for animation using pathLength
            style={{
              strokeDashoffset: pathLength, // Start with offset equal to path length (line hidden)
              animation: `drawTelepathyLine 10s linear infinite`, // Animate
            }}
          />
        </svg>
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
