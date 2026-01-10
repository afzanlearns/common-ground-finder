interface ScoreCircleProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreCircle({ score, label = "Fairness Score", size = "md" }: ScoreCircleProps) {
  const sizes = {
    sm: { container: "h-16 w-16", text: "text-xl", label: "text-[10px]" },
    md: { container: "h-20 w-20", text: "text-2xl", label: "text-xs" },
    lg: { container: "h-24 w-24", text: "text-3xl", label: "text-sm" },
  };

  const getScoreLabel = (val: number) => {
    if (val < 40) return "Initial Consensus";
    if (val < 60) return "Good Balance";
    if (val < 80) return "High Harmony";
    return "Perfect Alignment";
  };

  const s = sizes[size];
  const scoreLabel = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-1 group">
      <div className="label-uppercase text-muted-foreground mb-1">{label}</div>
      <div className={`${s.container} rounded-full border-2 border-primary/20 bg-card flex items-center justify-center transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-lg relative overflow-hidden`}>
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-primary/10 transition-all duration-700 scale-110 group-hover:scale-100 opacity-0 group-hover:opacity-100" />
        <span className={`font-serif ${s.text} text-foreground transition-transform duration-300 group-hover:scale-110`}>{score}</span>
      </div>
      <span className="text-xs text-primary italic font-serif transition-colors duration-300 group-hover:text-primary/80">{scoreLabel}</span>
    </div>
  );
}
