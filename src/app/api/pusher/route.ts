import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: "1981481",
  key: "af85db0ecd23f6502c1b",
  secret: "e71dbf15f65e683e14bd",
  cluster: "eu",
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { room, buttonClicked } = body;

    await pusher.trigger(room, "button-clicked", { button: buttonClicked });

    return NextResponse.json({ message: "Event triggered" }, { status: 200 });
  } catch (error) {
    console.error("Error triggering Pusher event:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export function OPTIONS(): NextResponse {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
    },
  });
}
