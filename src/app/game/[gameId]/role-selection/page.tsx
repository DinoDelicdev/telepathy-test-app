"use client";
import React, { useEffect, useRef } from "react"; // Using useRef to manage channel instance
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import pusherClient from "@/utils/pusherFrontendClient";

interface GameDataType {
  id: string;
  roomId: string;
  gameType: string;
  player1: { id: string; role: string };
  player2: { id: string; role: string };
  gameStarted: boolean;
}

const StartGameRoom = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();
  const channelNameRef = useRef<string | null>(null); // To store the current channel name

  useEffect(() => {
    const actualRoomIdForChannel = localStorage.getItem("current_game_roomId");

    console.log(
      `[StartGameRoom EFFECT RUN] gameId: ${gameId}, actualRoomId: ${actualRoomIdForChannel}`
    );

    if (!actualRoomIdForChannel) {
      console.error(
        "[StartGameRoom ERROR] 'current_game_roomId' not found. Aborting effect."
      );
      return;
    }

    const newChannelName = `room-${actualRoomIdForChannel}`;
    channelNameRef.current = newChannelName; // Store current channel name

    let channel = pusherClient.channel(newChannelName);

    if (!channel || !channel.subscribed) {
      // If channel doesn't exist, or exists but is not subscribed (e.g., after StrictMode cleanup)
      if (channel) { // If it exists but not subscribed
        console.log(`[StartGameRoom] Channel ${newChannelName} exists but is not subscribed. Unsubscribing first to be safe.`);
        pusherClient.unsubscribe(newChannelName); // Ensure clean state before re-subscribing
      }
      console.log(`[StartGameRoom] Subscribing to channel: ${newChannelName}`);
      channel = pusherClient.subscribe(newChannelName);
    } else {
      console.log(
        `[StartGameRoom] Already actively subscribed to channel: ${newChannelName}`
      );
    }

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`[StartGameRoom] Successfully subscribed to ${newChannelName}`);
    });

    channel.bind('pusher:subscription_error', (status: unknown) => {
      console.error(
        `[StartGameRoom] Failed to subscribe to ${newChannelName}, status:`,
        status
      );
    });

    const rolesSelectedHandler = (data: GameDataType) => {
      console.log(
        "[StartGameRoom] Pusher event 'roles-selected' RECEIVED. Data:",
        data
      );
      // Verify message is for the current room, especially if not unsubscribing aggressively
      if (data.roomId !== actualRoomIdForChannel) {
        console.warn(`[StartGameRoom] Received event for unexpected roomId ${data.roomId}. Current room is ${actualRoomIdForChannel}. Ignoring.`);
        return;
      }

      const playerId = localStorage.getItem("telephaty_player_id");
      if (!playerId) {
        console.error(
          "[StartGameRoom ERROR] 'telephaty_player_id' not found in localStorage."
        );
        return;
      }

      let userRole: string | null = null;
      if (data.player1 && data.player1.id === playerId) {
        userRole = data.player1.role;
      } else if (data.player2 && data.player2.id === playerId) {
        userRole = data.player2.role;
      }

      if (!userRole) {
        console.error(
          `[StartGameRoom ERROR] Could not determine user's role. Player ID: ${playerId}. Event Data:`,
          data
        );
        return;
      }

      localStorage.setItem("telepathy_user_role", userRole);
      console.log(
        `[StartGameRoom] Role determined: ${userRole}. Navigating to /game/${data.id}/${userRole}`
      );
      router.push(`/game/${data.id}/${userRole}`);
    };

    // Bind event
    channel.bind("roles-selected", rolesSelectedHandler);
    console.log(
      `[StartGameRoom] Bound 'roles-selected' event to channel ${newChannelName}.`
    );

    // Cleanup function
    return () => {
      const currentChannelName = channelNameRef.current; // Use the name from the ref for cleanup closure
      console.log(
        `[StartGameRoom CLEANUP] For channel ${currentChannelName}. Unbinding 'roles-selected'.`
      );
      // It's crucial to get the correct channel instance for unbinding,
      // especially if the channel object itself isn't stable across effect runs (though pusherClient.channel() should help).
      const channelToCleanup = pusherClient.channel(currentChannelName || "");
      if (channelToCleanup) {
        channelToCleanup.unbind("roles-selected", rolesSelectedHandler);
        // For Strict Mode, if you unsubscribe here, the next mount *must* re-subscribe.
        // The logic `!channel.subscribed` above is designed to handle this.
        pusherClient.unsubscribe(currentChannelName || ""); // Unsubscribe on cleanup
        console.log(`[StartGameRoom CLEANUP] Unsubscribed from ${currentChannelName}.`);
      } else {
        console.log(`[StartGameRoom CLEANUP] Channel ${currentChannelName} not found for unbinding/unsubscribing.`);
      }
    };
  }, [gameId, router]); // gameId dependency ensures re-subscription if the game context (URL) changes.


  // ... (rest of your StartGameRoom component: handleSettingSender, handleSettingReciever, JSX)
  const handleSettingSender = async () => {
    const playerId = localStorage.getItem("telephaty_player_id");

    const response = await fetch(`/api/game/${gameId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, roleSelected: "sender", userId: playerId }),
    });

    const data = await response.json();

    console.log("API Response for Sender:", data);
  };

  const handleSettingReciever = async () => {
    const playerId = localStorage.getItem("telephaty_player_id");

    const response = await fetch(`/api/game/${gameId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, roleSelected: "reciever", userId: playerId }),
    });

    const data = await response.json();

    console.log("API Response for Reciever:",data);
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