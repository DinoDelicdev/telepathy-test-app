"use client";
import React, { useEffect, useRef, useState } from "react"; // Using useRef to manage channel instance
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import pusherClient from "@/utils/pusherFrontendClient";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import ResultsModal from "@/components/resultsModal/ResultsModal";

interface GameDataType {
  id: string;
  roomId: string;
  gameType: string;
  player1: { id: string; role: null | string };
  player2: { id: string; role: null | string };
  gameStarted: boolean;
  move: number;
  reciever_display?: string[];
  correct_answer: string;
  is_last_move_correct?: boolean;
  number_correct?: number;
}

const SenderScreen = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();
  const channelNameRef = useRef<string | null>(null);
  const [imageToDisplay, setImageToDisplay] = useState<string | null>(null);
  const [move, setMove] = useState<number>(1);
  const [resultDisplayed, setResultsDisplayed] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [displayEndGame, setDisplayEndGame] = useState(false);

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
    channelNameRef.current = newChannelName;

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
      console.log("EJ EVO ME MOJI STARI DRUGOVI");
      console.log(data);
      setResultsDisplayed(true);
      setResult(data.is_last_move_correct ? "Correct" : "Wrong");

      // Automatically close the modal after 2 seconds
      setTimeout(() => {
        setResultsDisplayed(false);
      }, 3000);
      setImageToDisplay(data.correct_answer);
      if (data.move > 10) {
        setDisplayEndGame(true);
      }
      setMove(data.move);
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
      const data = await response.json();
      console.log(data);
      setImageToDisplay(data.correct_answer);
    };
    fetchInitialData();
  }, []);

  return (
    <div className="flex flex-col justify-center h-screen bg-amber-50 items-center">
      {displayEndGame ? <div>GOTOVO</div> : ""}
      {resultDisplayed && !displayEndGame ? (
        <ResultsModal result={result ? result : ""} />
      ) : (
        ""
      )}{" "}
      <h1 className="text-2xl mb-4">Move {move} of 10</h1>
      <Card className="min-h-[50%] mx-2 flex flex-col items-center max-h-[80%] bg-amber-50 max-w-[650px] w-[90%]">
        <CardHeader className="w-full text-center">
          SEND THIS IMAGE TO YOUR FRIEND
        </CardHeader>
        <CardContent>
          {imageToDisplay ? (
            <Image
              src={imageToDisplay}
              width={300}
              height={300}
              alt="Game Image"
            ></Image>
          ) : (
            <Spinner></Spinner>
          )}
        </CardContent>
      </Card>{" "}
    </div>
  );
};

export default SenderScreen;
