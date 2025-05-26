"use client";
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import pusherClient from "@/utils/pusherFrontendClient";
import { useRouter } from "next/navigation";

interface GameDataType {
  id: string;
  roomId: string;
  gameType: string;
  player1: { id: string; role: string };
  player2: { id: string; role: string };
  gameStarted: boolean;
}

const StartGameRoom = () => {
  const { gameId } = useParams();
  const router = useRouter();

  useEffect(() => {
    const roomId = localStorage.getItem("current_game_roomId");

    pusherClient.unsubscribe(`room-${roomId}`);

    // If gameId from params is what you want to subscribe to (assuming it's the roomId for Pusher)
    // const channel = pusherClient.subscribe(`room-${gameId}`); // Or if roomId from local storage is correct

    // Let's assume `gameId` from `useParams()` is actually the `roomId` that Pusher uses.
    // If not, you need to pass the `roomId` from the server to the client somehow
    // (e.g., through a response from a previous API call that creates the game,
    // or by storing it in local storage when the game is created).

    // **Crucial point: The channel name must match exactly what the server is triggering.**
    // The server is triggering on `room-${gameObj.roomId}`.
    // So, your client needs to subscribe to `room-${actual_roomId_value}`.

    // If `gameId` from `useParams()` is the `gameObj.id`, and `gameObj.roomId` is different,
    // you have a mismatch. You need to get the `roomId` associated with this `gameId`.

    // Assuming `gameId` from `useParams()` *is* the `roomId` for the channel:
    // const channelName = `room-${gameId}`; // Use gameId if it matches the roomId from your game object
    // Or if `roomId` from localStorage is indeed the correct Pusher room ID:
    // const channelName = `room-${roomId}`;

    // ISSUE 2: Subscription might not be happening or might be happening to the wrong channel.
    // `pusherClient.subscribe` should be called only once for a given channel.
    // If `gameId` changes, you'll subscribe to a new channel. This is handled by `useEffect` dependencies.
    // However, ensure the `gameId` is available when this `useEffect` runs.

    // Let's refine the channel subscription:
    let channel;
    if (roomId) {
      // Prioritize roomId from local storage if it's reliably set
      channel = pusherClient.subscribe(`room-${roomId}`);
      console.log(`Subscribing to channel: room-${roomId}`);
    } else if (gameId) {
      // Fallback to gameId if roomId isn't in local storage, assuming gameId is the room ID
      channel = pusherClient.subscribe(`room-${gameId}`);
      console.log(`Subscribing to channel: room-${gameId}`);
    } else {
      console.error("Neither roomId nor gameId available for Pusher subscription.");
      return; // Don't proceed with subscription if no ID is available
    }

    const handler = (data: GameDataType) => {
      console.log("Stigli su");
      console.log(data);
      const playerId = localStorage.getItem("telephaty_player_id");
      const role = data.player1.id === playerId ? data.player1.role : data.player2.role;
      localStorage.setItem("telepathy_user_role", role);
      router.push(`/game/${data.id}/${role}`);
    };

    channel.bind("roles-selected", handler);

    console.log(channel);

    return () => {
      channel.unbind("roles-selected", handler);
      channel.unsubscribe();
    };
  }, [gameId, router]);

  const handleSettingSender = async () => {
    const playerId = localStorage.getItem("telephaty_player_id");

    const response = await fetch(`/api/game/${gameId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, roleSelected: "sender", userId: playerId }),
    });

    const data = await response.json();

    console.log(data);
  };

  const handleSettingReciever = async () => {
    const playerId = localStorage.getItem("telephaty_player_id");

    const response = await fetch(`/api/game/${gameId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, roleSelected: "reciever", userId: playerId }),
    });

    const data = await response.json();

    console.log(data);
  };
  return (
    <div className="flex flex-col justify-center h-screen bg-amber-50 items-center">
      <Card className="min-h-[50%] mx-2 flex flex-col items-center max-h-[99%] bg-amber-50 max-w-[650px] min-w-[600px]">
        <CardHeader className="w-full text-center font-bold text-lg flex flex-col justify-center items-center">
          <p>SELECT YOUR ROLE</p>
        </CardHeader>
        <CardContent className="w-full flex flex-col gap-2 h-[80%] justify-center items-center">
          <Button className="w-[70%] mt-4" onClick={handleSettingSender}>
            Sender
          </Button>
          <Button className="w-[70%] mt-4" onClick={handleSettingReciever}>
            Reciever
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartGameRoom;
