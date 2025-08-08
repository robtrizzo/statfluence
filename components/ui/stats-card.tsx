import { Stat } from "@/types/stat";
import { Card, CardContent } from "./card";
import VariableColorText from "./variable-color-text";
import { colorClasses } from "@/lib/colors";
import { TypographyH3, TypographyP } from "./typography";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function StatsCard({
  title,
  stats,
}: {
  title?: string;
  stats?: Stat[];
}) {
  if (!stats || stats.length === 0)
    return (
      <>
        {title && <TypographyH3>{title}</TypographyH3>}
        <Card className="rounded-none">
          <CardContent>
            <TypographyP className="text-amber-800 font-sans">
              No stats available
            </TypographyP>
          </CardContent>
        </Card>
      </>
    );
  return (
    <>
      {title && <TypographyH3>{title}</TypographyH3>}
      <Card className="rounded-none">
        <CardContent className="flex items-center justify-center gap-6 flex-wrap">
          {stats.map((s, i) => (
            <div key={s.name + i} className="flex flex-col items-center">
              <VariableColorText
                color={s.color as keyof typeof colorClasses}
                className="text-2xl font-bold"
              >
                {s.value}
                {s.type === "percentage" && "%"}
                {s.trend === "up" && (
                  <TrendingUp className="inline-block" size={16} />
                )}
                {s.trend === "down" && (
                  <TrendingDown className="inline-block" size={16} />
                )}
              </VariableColorText>
              <span className="font-sans text-sm uppercase text-slate-700 font-semibold">
                {s.name}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
