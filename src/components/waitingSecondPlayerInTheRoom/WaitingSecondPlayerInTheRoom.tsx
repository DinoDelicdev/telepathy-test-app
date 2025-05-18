import React from "react";
import { JoiningRoomPropType } from "../joiningRoom/JoiningRoom";
import { Spinner } from "../ui/spinner";

const WaitingSecondPlayerInTheRoom: React.FC<JoiningRoomPropType> = ({ roomId }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-6">
      <h1>WELCOME TO THE ROOM: {roomId}</h1>
      <div>
        <h2>Waiting for second player to join the room...</h2>
        <Spinner size="large" />
      </div>
    </div>
  );
};

export default WaitingSecondPlayerInTheRoom;
