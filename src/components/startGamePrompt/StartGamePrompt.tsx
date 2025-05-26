import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { JoiningRoomPropType } from "../joiningRoom/JoiningRoom";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import pusherClient from "@/utils/pusherFrontendClient";

const gameTypes = [
  {
    key: "emotions",
    image: "/dog.png",
    title: "EMOTIONS",
    desc: "Guess the right character",
  },
  {
    key: "places",
    image: "/places.png",
    title: "PLACES",
    desc: "Pick the right place",
  },
  {
    key: "colors",
    color: "bg-pink-300",
    title: "COLORS",
    desc: "Pick the right color",
  },
  {
    key: "random_words",
    color: "bg-blue-200",
    text: "FOX",
    title: "RANDOM WORDS",
    desc: "Guess the random word",
  },
  {
    key: "custom_words",
    color: "bg-blue-200",
    text: "FOX",
    title: "CUSTOM WORDS",
    desc: "Mack your own set",
  },
  {
    key: "random_numbers",
    color: "bg-blue-200",
    text: "567",
    title: "RANDOM NUMBERS",
    desc: "Most difficult",
  },
];

const StartGamePrompt: React.FC<JoiningRoomPropType> = ({ roomId }) => {
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  interface GameDataType {
    id: string;
    roomId: string;
    gameType: string;
    player1: { id: string; role: null | string };
    player2: { id: string; role: null | string };
  }

  useEffect(() => {
    const channel = pusherClient.subscribe(`room-${roomId}`);

    channel.bind("game-started", (gameData: GameDataType) => {
      console.log("Data AGAIN");
      console.log(gameData);
      localStorage.setItem("current_game_roomId", gameData.roomId);
      if (gameData.roomId === localStorage.getItem("usersRoomId")) {
        console.log("I am the PLAYER 1");
        localStorage.setItem("telephaty_player_id", gameData.player1.id);
      } else {
        localStorage.setItem("telephaty_player_id", gameData.player2.id);
      }

      // channel.unsubscribe();
      router.push(`/game/${gameData.id}/role-selection`);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [roomId, router]);

  const handleSelect = (key: string) => {
    setSelectedGameType(key);
  };

  const handleProceed = async () => {
    if (!selectedGameType || isSubmitting) return;

    setIsSubmitting(true);
    const gameId = uuidv4();

    console.log(localStorage.getItem("userId"));
    const response = await fetch("/api/room/start-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, gameType: selectedGameType, gameId }),
    });

    const data = await response.json();

    console.log(data);
  };

  return (
    <div className="flex flex-col justify-center h-screen bg-amber-50">
      <Card className="min-h-[50%] mx-2 flex flex-col items-center max-h-[99%] bg-amber-50">
        <CardHeader className="w-full text-center font-bold text-lg flex flex-col justify-center items-center">
          <p>SELECT THE GAME TYPE</p>
          <Badge className="text-lg">{`IN THE ROOM: ${roomId}`}</Badge>
        </CardHeader>
        <CardContent className="w-full flex flex-col gap-2 h-[80%] justify-center items-center">
          {gameTypes.map((type) => (
            <Card key={type.key} className={`w-full max-h-[15%] justify-center items-center cursor-pointer transition-all ${selectedGameType === type.key ? "ring-2 ring-blue-500 scale-105" : ""}`} onClick={() => handleSelect(type.key)}>
              <CardContent className="w-full flex gap-15 items-center">
                {type.image ? <Image className="rounded-xl" src={type.image} width={70} height={70} alt={type.title} /> : <div className={`h-[70px] w-[70px] rounded-xl flex justify-center items-center ${type.color}`}>{type.text && <p className="text-xl text-blue-950 font-bold">{type.text}</p>}</div>}
                <div>
                  <p className="font-bold text-lg">{type.title}</p>
                  <i className="text-md">{type.desc}</i>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
        <Button className="w-[70%] mt-4" disabled={!selectedGameType || isSubmitting} onClick={handleProceed}>
          PROCEED
        </Button>
      </Card>
    </div>
  );
};

export default StartGamePrompt;
