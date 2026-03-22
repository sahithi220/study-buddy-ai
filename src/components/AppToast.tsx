import { CheckCircle2, AlertCircle } from "lucide-react";

interface AppToastProps {
  type: "success" | "error";
  text: string;
}

const AppToast = ({ type, text }: AppToastProps) => (
  <div
    className={`fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-bottom-4 max-w-[calc(100vw-2rem)] ${
      type === "success"
        ? "bg-primary text-primary-foreground"
        : "bg-destructive text-destructive-foreground"
    }`}
  >
    {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
    <span>{text}</span>
  </div>
);

export default AppToast;
