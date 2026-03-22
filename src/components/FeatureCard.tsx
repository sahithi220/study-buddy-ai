import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  icon: ReactNode;
  desc: string;
}

const FeatureCard = ({ title, icon, desc }: FeatureCardProps) => (
  <div className="hover-rise rounded-xl border border-border bg-card p-6 flex flex-col gap-3">
    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </div>
);

export default FeatureCard;
