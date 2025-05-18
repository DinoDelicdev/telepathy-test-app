// src/app/api/room/[roomId]/enter/route.ts
import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redisClient";

export async function POST(req: NextRequest) {
  const roomId = req.nextUrl.pathname.split("/")[3];

  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
  }

  // Get the current user count and ensure it's a number
  const currentUserCount = parseInt((await redis.get(`room:${roomId}:userCount`)) || "0", 10);

  // Check if the room is full
  if (currentUserCount >= 2) {
    return NextResponse.json({ error: "Room is full" }, { status: 403 });
  }

  // Increment the user count in Redis
  const userCount = await redis.incr(`room:${roomId}:userCount`);

  return NextResponse.json({ userCount });
}
