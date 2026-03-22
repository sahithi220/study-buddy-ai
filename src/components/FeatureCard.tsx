import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  icon: ReactNode;
  desc: string;
}

const FeatureCard = ({ title, icon, desc }: FeatureCardProps) => (
  <div className="hover-rise rounded-xl border border-border bg-card p-4 sm:p-6 flex flex-col gap-2 sm:gap-3">
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-accent flex items-center justify-center text-primary">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
    <p className="text-xs sm:text-sm text-muted-foreground">{desc}</p>
  </div>
);

export default FeatureCard;
