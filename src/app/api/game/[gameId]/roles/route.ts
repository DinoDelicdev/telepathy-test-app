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
  const { gameId, userId, roleSelected } = await req.json();

  console.log("_________________-");
  console.log(gameId, userId, roleSelected);

  if (!roleSelected || !userId || !gameId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  let secondRole = roleSelected === "sender" ? "reciever" : "sender";

  const currentGames: GameDataType[] | null = await redis.get("current-games");
  console.log("CCCCCCCCCCCCc");
  console.log(currentGames);
  if (!currentGames) {
    return NextResponse.json({ error: "No current games found" }, { status: 404 });
  }

  const gameObj = currentGames.filter((g: GameDataType) => {
    return g.id === gameId;
  })[0];

  if (gameObj.player1.id === userId) {
    gameObj.player1.role = roleSelected;
    gameObj.player2.role = secondRole;
    gameObj.gameStarted = true;
  } else {
    gameObj.player2.role = roleSelected;
    gameObj.player1.role = secondRole;
  }

  gameObj.gameStarted = true;

  const newCurrentGames = await redis.set("current-games", JSON.stringify(currentGames));

  console.log("IDE PUSHER");
  await pusher.trigger(`room-${gameObj.roomId}`, "roles-selected", gameObj);
  console.log("ODE PUSHER");

  return NextResponse.json({ ok: true });
}
