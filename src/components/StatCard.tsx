interface StatCardProps {
  title: string;
  value: number;
}

const StatCard = ({ title, value }: StatCardProps) => (
  <div className="hover-rise rounded-lg border border-border bg-card p-3 sm:p-5 text-center">
    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
    <h3 className="mt-1 text-2xl sm:text-3xl font-bold text-foreground">{value}</h3>
  </div>
);

export default StatCard;
