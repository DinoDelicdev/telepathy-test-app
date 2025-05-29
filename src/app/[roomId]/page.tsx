"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import JoiningRoom from "@/components/joiningRoom/JoiningRoom";
import WaitingSecondPlayerInTheRoom from "@/components/waitingSecondPlayerInTheRoom/WaitingSecondPlayerInTheRoom";
import StartGamePrompt from "@/components/startGamePrompt/StartGamePrompt";
import pusherClient from "@/utils/pusherFrontendClient";

const RoomEntryPage = () => {
  const { roomId } = useParams();
  const [userCount, setUserCount] = useState(0);
  const hasEntered = useRef(false);

  useEffect(() => {
    if (!hasEntered.current) {
      fetch(`/api/room/${roomId}/enter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId }), // Send roomId in the body
      });
      hasEntered.current = true;
    }

    const channel = pusherClient.subscribe(`room-${roomId}`);

    channel.bind("user-count-updated", (data: { userCount: number }) => {
      console.log("DATA");
      setUserCount(data.userCount);
      // if (data.userCount >= 2) channel.unsubscribe();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      // pusherClient.disconnect();
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
