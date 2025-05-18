import React from "react";
import { Spinner } from "../ui/spinner";
import { ParamValue } from "next/dist/server/request/params";

export interface JoiningRoomPropType {
  roomId: ParamValue;
}

const JoiningRoom: React.FC<JoiningRoomPropType> = ({ roomId }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1>Joining room {roomId}</h1>
      <Spinner size="large" />
    </div>
  );
};

export default JoiningRoom;
