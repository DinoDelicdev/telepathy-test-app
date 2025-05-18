// src/app/api/room/[roomId]/sse/route.ts
import { NextRequest } from "next/server";
import redis from "@/utils/redisClient";

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.pathname.split("/")[3];

  console.log("HERE");

  console.log(roomId);

  if (!roomId) {
    return new Response("Room ID is required", { status: 400 });
  }

  return new Response(
    new ReadableStream({
      async start(controller: ReadableStreamDefaultController) {
        const encoder = new TextEncoder();
        const sendUserCount = async () => {
          const userCount = (await redis.get(`room:${roomId}:userCount`)) || 0;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ userCount })}\n\n`));
        };

        await sendUserCount();

        const interval = setInterval(sendUserCount, 5000);

        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
        });
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
}
