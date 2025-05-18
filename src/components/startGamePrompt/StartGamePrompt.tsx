import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { JoiningRoomPropType } from "../joiningRoom/JoiningRoom";
import { Badge } from "../ui/badge";

const StartGamePrompt: React.FC<JoiningRoomPropType> = ({ roomId }) => {
  return (
    <div className="flex flex-col justify-center h-screen bg-amber-50">
      <Card className="min-h-[50%] mx-2 flex flex-col items-center max-h-[99%] bg-amber-50">
        <CardHeader className="w-full text-center font-bold text-lg flex flex-col justify-center items-center">
          <p>SELECT THE GAME TYPE</p>
          <Badge className="text-lg">{`IN THE ROOM: ${roomId}`}</Badge>
        </CardHeader>

        <CardContent className="w-full flex flex-col gap-2 h-[80%] justify-center items-center">
          <Card className="w-full max-h-[15%] justify-center items-center">
            <CardContent className="w-full flex gap-15 items-center ">
              <Image className="rounded-xl" src={"/dog.png"} width={70} height={70} alt="da"></Image>
              <div>
                <p className="font-bold text-lg">EMOTIONS</p>
                <i className="text-md">Guess the right character</i>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full max-h-[15%] justify-center items-center">
            <CardContent className="w-full flex  gap-15 items-center ">
              <Image className="rounded-xl" src={"/places.png"} width={70} height={70} alt="da"></Image>
              <div>
                <p className="font-bold text-lg">PLACES</p>
                <i className="text-md">Pick the right place</i>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full max-h-[15%] justify-center items-center">
            <CardContent className="w-full flex  gap-15 items-center ">
              {/* <Image className="rounded-xl" src={"/dog.png"} width={70} height={70} alt="da"></Image> */}
              <div className="h-[70px] w-[70px] bg-pink-300 rounded-xl"></div>
              <div>
                <p className="font-bold text-lg">COLORS</p>
                <i className="text-md">Pick the right color</i>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full max-h-[15%] justify-center items-center">
            <CardContent className="w-full flex gap-15 items-center ">
              {/* <Image className="rounded-xl" src={"/dog.png"} width={70} height={70} alt="da"></Image> */}
              <div className="h-[70px] w-[70px] bg-blue-200 rounded-xl flex justify-center items-center">
                <p className="text-xl text-blue-950 font-bold">FOX</p>
              </div>
              <div>
                <p className="font-bold text-lg">RANDOM WORDS</p>
                <i className="text-md">Guess the random word</i>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full max-h-[15%] justify-center items-center">
            <CardContent className="w-full flex gap-15 items-center ">
              {/* <Image className="rounded-xl" src={"/dog.png"} width={70} height={70} alt="da"></Image> */}
              <div className="h-[70px] w-[70px] bg-blue-200 rounded-xl flex justify-center items-center">
                <p className="text-xl text-blue-950 font-bold">FOX</p>
              </div>
              <div>
                <p className="font-bold text-lg">CUSTOM WORDS</p>
                <i className="text-md">Mack your own set</i>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full max-h-[15%] justify-center items-center">
            <CardContent className="w-full flex gap-15 items-center ">
              {/* <Image className="rounded-xl" src={"/dog.png"} width={70} height={70} alt="da"></Image> */}
              <div className="h-[70px] w-[70px] bg-blue-200 rounded-xl flex justify-center items-center">
                <p className="text-xl text-blue-950 font-bold">567</p>
              </div>
              <div>
                <p className="font-bold text-lg">RANDOM NUMBERS</p>
                <i className="text-md">Most difficult</i>
              </div>
            </CardContent>
          </Card>
        </CardContent>

        <Button className="w-[70%]">PROCEED</Button>
      </Card>
    </div>
  );
};

export default StartGamePrompt;
