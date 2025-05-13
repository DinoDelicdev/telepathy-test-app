import { NextRequest } from "next/server";

type Client = {
  id: number;
  roomId: string;
  send: (msg: string) => void;
};

let clients: Client[] = [];

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get("room");
  if (!roomId) return new Response("Missing room ID", { status: 400 });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const id = Date.now();
      const send = (msg: string) => {
        controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
      };

      const client: Client = { id, roomId, send };
      clients.push(client);

      req.signal.addEventListener("abort", () => {
        clients = clients.filter((c) => c.id !== id);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export function broadcast(roomId: string, data: any) {
  clients.filter((c) => c.roomId === roomId).forEach((c) => c.send(JSON.stringify(data)));
}
