import { ReactNode } from "react";

interface SmallToolCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
}

const SmallToolCard = ({ icon, title, desc }: SmallToolCardProps) => (
  <div className="hover-rise flex items-start gap-3 rounded-lg border border-border bg-card p-4">
    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-sm text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </div>
  </div>
);

export default SmallToolCard;
