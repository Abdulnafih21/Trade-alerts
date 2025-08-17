"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

const heatmapData = [
  { symbol: "BTC", change: 2.34, volume: 1.2e9 },
  { symbol: "ETH", change: -1.23, volume: 8.5e8 },
  { symbol: "SPY", change: 0.87, volume: 2.1e8 },
  { symbol: "QQQ", change: 1.45, volume: 1.8e8 },
  { symbol: "TSLA", change: -3.21, volume: 3.2e8 },
  { symbol: "AAPL", change: 0.56, volume: 2.8e8 },
  { symbol: "NVDA", change: 4.12, volume: 4.1e8 },
  { symbol: "MSFT", change: 1.89, volume: 1.9e8 },
]

export function MarketHeatmap() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-[var(--font-heading)]">Market Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {heatmapData.map((item) => (
            <div
              key={item.symbol}
              className={`p-3 rounded-lg text-center transition-colors ${
                item.change > 0 ? "bg-chart-4/20 hover:bg-chart-4/30" : "bg-chart-2/20 hover:bg-chart-2/30"
              }`}
            >
              <div className="flex items-center justify-center space-x-1 mb-1">
                {item.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-chart-4" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-chart-2" />
                )}
                <span className="font-semibold text-sm">{item.symbol}</span>
              </div>
              <div className={`text-lg font-bold ${item.change > 0 ? "text-chart-4" : "text-chart-2"}`}>
                {item.change > 0 ? "+" : ""}
                {item.change.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">Vol: {(item.volume / 1e6).toFixed(0)}M</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
