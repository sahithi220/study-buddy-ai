import { useState } from "react";

interface QuizCardProps {
  item: { id: number; question: string; answer: string };
}

const QuizCard = ({ item }: QuizCardProps) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="hover-rise rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold text-foreground mb-4">{item.question}</h3>
      <button
        className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
        onClick={() => setShowAnswer((p) => !p)}
      >
        {showAnswer ? "Hide Answer" : "Show Answer"}
      </button>
      {showAnswer && (
        <p className="mt-3 text-sm text-primary font-medium">
          Answer: {item.answer}
        </p>
      )}
    </div>
  );
};

export default QuizCard;
