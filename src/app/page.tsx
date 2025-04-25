import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 justify-center items-center h-screen w-screen">
      <h1 className="text-2xl">SIMPLE TELEPATHY TEST</h1>

      <Button variant={"outline"}>Click ME</Button>
    </div>
  );
}
