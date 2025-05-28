import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redisClient";

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
  is_last_move_correct?: boolean
}

export async function POST(req: NextRequest) {
  const { gameId } = await req.json();

  

  if (!gameId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  

  const currentGames: GameDataType[] | null = await redis.get("current-games");
  if (!currentGames) {
    return NextResponse.json({ error: "No current games found" }, { status: 404 });
  }

  const gameObj = currentGames.filter((g: GameDataType) => {
    return g.id === gameId;
  })[0];



  return NextResponse.json(gameObj);
}
