import { NextRequest, NextResponse } from "next/server";
import pusher from "@/utils/pusherBackendClient";

export async function POST(req: NextRequest) {
  const { roomId, gameType, gameId } = await req.json();

  if (!roomId || !gameType || !gameId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Trigger the "game-started" event for the room
  await pusher.trigger(`room-${roomId}`, "game-started", { gameType, gameId });

  return NextResponse.json({ ok: true });
}
