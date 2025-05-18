"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import JoiningRoom from "@/components/joiningRoom/JoiningRoom";
import WaitingSecondPlayerInTheRoom from "@/components/waitingSecondPlayerInTheRoom/WaitingSecondPlayerInTheRoom";
import StartGamePrompt from "@/components/startGamePrompt/StartGamePrompt";

const RoomEntryPage = () => {
  const { roomId } = useParams();
  const [userCount, setUserCount] = useState(0);
  const hasEntered = useRef(false);

  useEffect(() => {
    if (!hasEntered.current) {
      // Notify the server that a user has entered the room
      fetch(`/api/room/${roomId}/enter`, { method: "POST" });
      hasEntered.current = true;
    }

    // Connect to the SSE endpoint
    const eventSource = new EventSource(`/api/room/${roomId}/sse`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setUserCount(data.userCount);
    };

    return () => {
      eventSource.close();
    };
  }, [roomId]);

  return (
    <div className="flex flex-col">
      {userCount === 0 ? <JoiningRoom roomId={roomId} /> : ""}
      {userCount === 1 ? <WaitingSecondPlayerInTheRoom roomId={roomId} /> : ""}
      {userCount === 2 ? <StartGamePrompt roomId={roomId} /> : ""}
    </div>
  );
};

export default RoomEntryPage;
