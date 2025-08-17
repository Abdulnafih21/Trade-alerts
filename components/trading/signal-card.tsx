import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown } from "lucide-react"

interface SignalCardProps {
  signal: {
    id: number
    symbol: string
    side: "LONG" | "SHORT"
    confidence: number
    price: number
    time: string
    reason: string
  }
}

export function SignalCard({ signal }: SignalCardProps) {
  return (
    <Card className="bg-card border-border hover:bg-card/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {signal.side === "LONG" ? (
              <TrendingUp className="h-5 w-5 text-chart-4" />
            ) : (
              <TrendingDown className="h-5 w-5 text-chart-2" />
            )}
            <div>
              <div className="font-semibold">{signal.symbol}</div>
              <div className="text-sm text-muted-foreground">{signal.reason}</div>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant={signal.side === "LONG" ? "default" : "destructive"}
              className={signal.side === "LONG" ? "bg-chart-4 hover:bg-chart-4/80" : "bg-chart-2 hover:bg-chart-2/80"}
            >
              {signal.side}
            </Badge>
            <div className="text-sm font-medium mt-1">${signal.price.toLocaleString()}</div>
            <div className="flex items-center space-x-2 mt-1">
              <Progress value={signal.confidence * 100} className="w-16 h-2" />
              <span className="text-xs">{Math.round(signal.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
