import { NextRequest, NextResponse } from "next/server";
import pusher from "@/utils/pusherBackendClient";
import redis from "@/utils/redisClient";
import { v4 as uuidv4 } from "uuid";

interface GameDataType {
  id: string;
  roomId: string;
  gameType: string;
  player1: { id: string; role: null | string };
  player2: { id: string; role: null | string };
  gameStarted: boolean;
}

export async function POST(req: NextRequest) {
  const { roomId, gameType, gameId, userId } = await req.json();

  if (!roomId || !gameType || !gameId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const player1Id = uuidv4();
  const player2Id = uuidv4();

  const gameObj = {
    id: gameId,
    roomId: roomId,
    gameType: gameType,
    player1: {
      id: player1Id,
      role: null,
    },
    player2: {
      id: player2Id,
      role: null,
    },
    gameStarted: false,
  };

  console.log(gameObj);

  const currentGames: GameDataType[] | null = await redis.get("current-games");

  console.log("current games", currentGames);

  if (!currentGames) {
    await redis.set("current-games", JSON.stringify([gameObj]));
  } else {
    const newCurrentGames = await redis.set("current-games", JSON.stringify([...currentGames, gameObj]));

    console.log("new games", newCurrentGames);
  }

  // Trigger the "game-started" event for the room
  await pusher.trigger(`room-${roomId}`, "game-started", gameObj);

  return NextResponse.json({ ok: true });
}
