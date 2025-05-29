import { NextRequest, NextResponse } from "next/server";
import pusher from "@/utils/pusherBackendClient";
import redis from "@/utils/redisClient";

export async function POST(req: NextRequest) {
  const { roomId } = await req.json();

  console.log("EVO ME");
  console.log(roomId);

  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }

  // Increment user count in Redis
  const userCount = await redis.incr(`room:${roomId}:userCount`);

  // Optionally, set an expiry so empty rooms are cleaned up
  await redis.expire(`room:${roomId}:userCount`, 3600);

  // Notify all clients in the room via Pusher
  await pusher.trigger(`room-${roomId}`, "user-count-updated", { userCount });

  return NextResponse.json({ userCount });
}
