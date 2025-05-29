import React, { useEffect, useState } from "react";

interface ResultsModalProps {
  result: string;
}

const correctMessages = [
  {
    quote: "The Force is strong with this one.",
    quote_origin: "Obi-Wan Kenobi",
  },
  {
    quote: "These are not the droids you're looking for.",
    quote_origin: "Obi-Wan Kenobi",
  },
  {
    quote: "I know what you're thinking.",
    quote_origin: "Professor Charles Xavier",
  },
  {
    quote: "What we achieve inwardly will change outer reality.",
    quote_origin: "Ralph Waldo Emerson",
  },
  {
    quote: "All that we are is the result of what we have thought.",
    quote_origin: "Buddha",
  },
  {
    quote: "Intuition is the very force or activity of the soul in its experience through the body.",
    quote_origin: "Terence McKenna",
  },
  {
    quote: "The heart has its reasons which reason knows nothing of.",
    quote_origin: "Blaise Pascal",
  },
  {
    quote: "We are all connected; to each other, biologically. To the Earth, chemically. To the rest of the universe, atomically.",
    quote_origin: "Neil deGrasse Tyson",
  },
  {
    quote: "She hears me. She always hears me.",
    quote_origin: "Eleven",
  },
  {
    quote: "There is a deep knowing within each of us that is beyond the reach of the analytical mind.",
    quote_origin: "Deepak Chopra",
  },
];

const notCorrectMessages = [
  {
    quote: "Get out of my head, Charles!",
    quote_origin: "Magneto",
  },
  {
    quote: "I feel a great disturbance in the Force, as if millions of voices suddenly cried out in terror and were suddenly silenced.",
    quote_origin: "Obi-Wan Kenobi",
  },
  {
    quote: "The mind is a turbulent river.",
    quote_origin: "Buddha",
  },
  {
    quote: "When you gaze long into an abyss, the abyss also gazes into you.",
    quote_origin: "Friedrich Nietzsche",
  },
  {
    quote: "There are more things in heaven and earth, Horatio, than are dreamt of in your philosophy.",
    quote_origin: "Hamlet",
  },
  {
    quote: "Confusion of ideas is the root of all evil.",
    quote_origin: "Terence McKenna",
  },
  {
    quote: "All I know is that I know nothing.",
    quote_origin: "Socrates",
  },
  {
    quote: "The unexamined life is not worth living.",
    quote_origin: "Socrates",
  },
  {
    quote: "I cannot penetrate his mind.",
    quote_origin: "Lord Voldemort",
  },
  {
    quote: "The truth is rarely pure and never simple.",
    quote_origin: "Oscar Wilde",
  },
];

const ResultsModal: React.FC<ResultsModalProps> = ({ result }) => {
  const [quote, setQuote] = useState<{ quote: string; quote_origin: string } | null>(null);
  const [counter, setCounter] = useState(3);

  useEffect(() => {
    if (result === "Correct") {
      // Select a random quote from correctMessages
      const randomQuote = correctMessages[Math.floor(Math.random() * correctMessages.length)];
      setQuote(randomQuote);
    } else if (result === "Wrong") {
      // Select a random quote from notCorrectMessages
      const randomQuote = notCorrectMessages[Math.floor(Math.random() * notCorrectMessages.length)];
      setQuote(randomQuote);
    }

    // Countdown logic
    const interval = setInterval(() => {
      setCounter((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [result]);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className={`text-2xl font-bold ${result === "Correct" ? "text-green-500" : "text-red-500"}`}>{result}</h2>
        {quote && (
          <div className="mt-4">
            <p className="italic">{`"${quote.quote}"`}</p>
            <p className="text-sm text-gray-500">{`- ${quote.quote_origin}`}</p>
          </div>
        )}
        <div className="mt-4 text-gray-700">
          <p>Next in {counter}...</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
