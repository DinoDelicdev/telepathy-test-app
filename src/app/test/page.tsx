"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";

const Home = () => {
  const [buttonClicked, setButtonClicked] = useState<string | null>(null);

  useEffect(() => {
    const pusher = new Pusher("af85db0ecd23f6502c1b", {
      cluster: "eu",
    });

    const channel = pusher.subscribe("room-123");

    channel.bind("button-clicked", function (data: { button: string }) {
      setButtonClicked(data.button);
    });

    return () => {
      pusher.unsubscribe("room-123");
    };
  }, []);

  const handleButtonClick = async (button: string) => {
    // Send the button click event to the API
    await fetch("/api/pusher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room: "room-123", buttonClicked: button }),
    });
  };

  return (
    <div>
      <button onClick={() => handleButtonClick("button1")}>Click Button 1</button>
      <button onClick={() => handleButtonClick("button2")}>Click Button 2</button>
      <button onClick={() => handleButtonClick("button3")}>Click Button 3</button>
      <button onClick={() => handleButtonClick("button4")}>Click Button 4</button>

      {buttonClicked && <p>Button clicked: {buttonClicked}</p>}
    </div>
  );
};

export default Home;
