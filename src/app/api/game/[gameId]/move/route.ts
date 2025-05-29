import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redisClient";
import images from "@/utils/images";
import pusher from "@/utils/pusherBackendClient";

interface GameDataType {
  id: string;
  roomId: string;
  gameType: string;
  player1: { id: string; role: null | string };
  player2: { id: string; role: null | string };
  gameStarted: boolean;
  move: number;
  reciever_display?: string[];
  correct_answer?: string;
  is_last_move_correct?: boolean;
  number_correct: number;
}

export async function POST(req: NextRequest) {
  const { gameId, selectedImage } = await req.json();
  if (!gameId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }
  const currentGames: GameDataType[] | null = await redis.get("current-games");
  if (!currentGames) {
    return NextResponse.json(
      { error: "No current games found" },
      { status: 404 }
    );
  }

  const gameObj = currentGames.filter((g: GameDataType) => {
    return g.id === gameId;
  })[0];

  const shuffledImages = images.sort(() => 0.5 - Math.random());
  const recieverDisplay = shuffledImages.slice(0, 4);

  const correctAnswer =
    recieverDisplay[Math.floor(Math.random() * recieverDisplay.length)];
  gameObj.is_last_move_correct = gameObj.correct_answer === selectedImage;
  gameObj.number_correct =
    gameObj.correct_answer === selectedImage
      ? gameObj.number_correct + 1
      : gameObj.number_correct;

  gameObj.reciever_display = recieverDisplay;
  gameObj.correct_answer = correctAnswer;

  gameObj.move = gameObj.move + 1;

  const newCurrentGames = await redis.set(
    "current-games",
    JSON.stringify(currentGames)
  );

  console.log("IDE PUSHER");
  await pusher.trigger(`room-${gameObj.roomId}`, "move-ready", gameObj);
  console.log("ODE PUSHER");

  return NextResponse.json(gameObj);
}
