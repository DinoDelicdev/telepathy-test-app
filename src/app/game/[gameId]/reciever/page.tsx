"use client";
import React, { useEffect, useRef, useState } from "react"; // Using useRef to manage channel instance
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import pusherClient from "@/utils/pusherFrontendClient";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface GameDataType {
  id: string;
  roomId: string;
  gameType: string;
  player1: { id: string; role: null | string };
  player2: { id: string; role: null | string };
  gameStarted: boolean;
  move?: number;
  reciever_display?: string[];
  correct_answer?: string;
  is_last_move_correct?: boolean;
}

const RecieverScreen = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();
  const channelNameRef = useRef<string | null>(null);
  const [imagesToDisplay, setImagesToDisplay] = useState<string[] | []>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [move, setMove] = useState<number>(1);

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
      if (channel) {
        // If it exists but not subscribed
        console.log(
          `[StartGameRoom] Channel ${newChannelName} exists but is not subscribed. Unsubscribing first to be safe.`
        );
        pusherClient.unsubscribe(newChannelName); // Ensure clean state before re-subscribing
      }
      console.log(`[StartGameRoom] Subscribing to channel: ${newChannelName}`);
      channel = pusherClient.subscribe(newChannelName);
    } else {
      console.log(
        `[StartGameRoom] Already actively subscribed to channel: ${newChannelName}`
      );
    }

    channel.bind("pusher:subscription_succeeded", () => {
      console.log(
        `[StartGameRoom] Successfully subscribed to ${newChannelName}`
      );
    });

    channel.bind("pusher:subscription_error", (status: unknown) => {
      console.error(
        `[StartGameRoom] Failed to subscribe to ${newChannelName}, status:`,
        status
      );
    });

    const moveReadyHandler = (data: GameDataType) => {
      console.log("Ej evo meeeee");
    };

    // Bind event
    channel.bind("move-ready", moveReadyHandler);
    console.log(
      `[StartGameRoom] Bound 'move-ready' event to channel ${newChannelName}.`
    );

    // Cleanup function
    return () => {
      const currentChannelName = channelNameRef.current; // Use the name from the ref for cleanup closure
      console.log(
        `[StartGameRoom CLEANUP] For channel ${currentChannelName}. Unbinding 'roles-selected'.`
      );

      const channelToCleanup = pusherClient.channel(currentChannelName || "");
      if (channelToCleanup) {
        channelToCleanup.unbind("move-ready", moveReadyHandler);

        pusherClient.unsubscribe(currentChannelName || "");
        console.log(
          `[StartGameRoom CLEANUP] Unsubscribed from ${currentChannelName}.`
        );
      } else {
        console.log(
          `[StartGameRoom CLEANUP] Channel ${currentChannelName} not found for unbinding/unsubscribing.`
        );
      }
    };
  }, [gameId, router]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const response = await fetch(`/api/game/${gameId}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
        }),
      });
      const data: GameDataType = await response.json();
      console.log(data);
      setImagesToDisplay(data.reciever_display || []);
    };
    fetchInitialData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedImage) return
    const response = await fetch(`/api/game/${gameId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        selectedImage
      }),
    });
    const data = await response.json();
    console.log(data);
    alert(`${data.is_last_move_correct ? "Correct" : "Wrong"}`)
    setMove(data.move)
    setImagesToDisplay(data.reciever_display || []);
  };

  return (
    <div className="flex flex-col justify-center h-screen bg-amber-50 items-center">
      {" "}
      <h1 className="text-2xl mb-4">Move {move} of 10</h1>
      <Card className="min-h-[50%] mx-2 flex flex-col items-center max-h-[80%] bg-amber-50 max-w-[650px] min-w-[600px]">
        <CardHeader className="w-full text-center">PICK ONE</CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {imagesToDisplay.length
              ? imagesToDisplay.map((i) => {
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedImage(i)
                      }}
                      className="hover:scale-105 transition-transform"
                      style={{
                        borderWidth: selectedImage === i ? "4px" : "0px",
                        borderColor: selectedImage === i ? "black" : "trnasparent"
                      }}
                    >
                      <Image src={i} width={200} height={200} alt="Image" />
                    </button>
                  );
                })
              : ""}
          </div>
        </CardContent>
        <CardFooter><Button onClick={handleSubmit}>SEND ANSWER</Button></CardFooter>
      </Card>{" "}
    </div>
  );
};

export default RecieverScreen;
