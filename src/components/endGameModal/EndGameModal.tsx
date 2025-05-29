import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EndGameModalProps {
  result: number;
}

const EndGameModal: React.FC<EndGameModalProps> = ({ result }) => {
  const router = useRouter();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card className="w-[90%] max-w-[500px] bg-white shadow-lg rounded-lg">
        <CardHeader className="text-center text-2xl font-bold">Game Over</CardHeader>
        <CardContent className="text-center">
          <p className="text-xl mb-4">You got {result} of 10 right</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/")} className="bg-blue-500 text-white">
              START ANOTHER GAME
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndGameModal;
