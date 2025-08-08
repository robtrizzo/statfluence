import { colorClasses } from "@/lib/colors";
import { cn } from "@/lib/utils";

export default function VariableColorText({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color: keyof typeof colorClasses;
  className?: string;
}) {
  return (
    <span className={cn(colorClasses[color] || "text-slate-700", className)}>
      {children}
    </span>
  );
}
