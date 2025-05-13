// app/click/route.ts
import { NextRequest } from "next/server";
import { broadcast } from "../sse/route";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomId, button } = body;

  if (!roomId || button == null) return new Response("Missing data", { status: 400 });

  broadcast(roomId, { button });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
