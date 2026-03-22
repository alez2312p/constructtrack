import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, ArrowRight } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  variant?: "default" | "warning" | "success" | "danger";
}

export function SummaryCard({ title, value, icon: Icon, href, variant = "default" }: SummaryCardProps) {
  const variantStyles = {
    default: "",
    warning: "border-amber-500",
    success: "border-green-500",
    danger: "border-red-500"
  };

  const iconColorStyles = {
    default: "text-muted-foreground",
    warning: "text-amber-500",
    success: "text-green-500",
    danger: "text-red-500"
  };

  const valueColorStyles = {
    default: "",
    warning: "text-amber-600",
    success: "text-green-600",
    danger: "text-red-600"
  };

  const cardContent = (
    <Card className={`p-1 gap-2 cursor-pointer hover:bg-muted/50 transition-colors ${variantStyles[variant]}`}>
      <CardHeader className="flex flex-row items-center justify-between p-2">
        <CardTitle className="md:text-lg font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`${iconColorStyles[variant]}`} />
      </CardHeader>
      <CardContent className="px-3 pt-0">
        <div className="flex items-center justify-between">
          <div className={`text-2xl font-bold ${valueColorStyles[variant]}`}>{value}</div>
          {href && <ArrowRight className="text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
