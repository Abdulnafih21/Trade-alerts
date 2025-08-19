"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Clock, Target, Shield } from "lucide-react"

interface Signal {
  id: string
  symbol: string
  side: "LONG" | "SHORT"
  confidence: number
  price: number
  timestamp: Date
  reason: string
  stopLoss: number
  takeProfit: number
  riskReward: number
  status: "active" | "filled" | "cancelled"
}

const generateSignal = (): Signal => {
  const symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "SOLUSDT", "DOTUSDT", "LINKUSDT"]
  const reasons = [
    "EMA crossover + volume spike",
    "RSI oversold + support bounce",
    "Breakout above resistance",
    "News sentiment + momentum",
    "Liquidity sweep detected",
    "Mean reversion setup",
    "Institutional flow detected",
    "Technical pattern completion",
  ]

  const symbol = symbols[Math.floor(Math.random() * symbols.length)]
  const side = Math.random() > 0.5 ? "LONG" : "SHORT"
  const basePrice = symbol === "BTCUSDT" ? 67000 : symbol === "ETHUSDT" ? 3400 : 1.5
  const price = basePrice + (Math.random() - 0.5) * basePrice * 0.02
  const confidence = 0.6 + Math.random() * 0.35

  return {
    id: Math.random().toString(36).substr(2, 9),
    symbol,
    side,
    confidence,
    price: Math.round(price * 100) / 100,
    timestamp: new Date(),
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    stopLoss: side === "LONG" ? price * 0.98 : price * 1.02,
    takeProfit: side === "LONG" ? price * 1.04 : price * 0.96,
    riskReward: 1.5 + Math.random() * 1.5,
    status: "active",
  }
}

export function SignalFeed() {
  const [signals, setSignals] = useState<Signal[]>([generateSignal(), generateSignal(), generateSignal()])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance to generate new signal
        setSignals((prev) => [generateSignal(), ...prev.slice(0, 9)])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-[var(--font-heading)] flex items-center justify-between">
          Live Signal Feed
          <Badge variant="secondary" className="bg-primary/20 text-primary animate-pulse">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {signals.map((signal) => (
          <div
            key={signal.id}
            className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Badge
                  variant={signal.side === "LONG" ? "default" : "destructive"}
                  className={`${
                    signal.side === "LONG"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  } font-semibold`}
                >
                  {signal.side === "LONG" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {signal.side}
                </Badge>
                <div>
                  <div className="font-semibold text-foreground">{signal.symbol}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(signal.timestamp)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${signal.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{Math.round(signal.confidence * 100)}% confidence</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-3">{signal.reason}</div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-red-400" />
                <span className="text-muted-foreground">SL:</span>
                <span className="font-medium">${signal.stopLoss.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-green-400" />
                <span className="text-muted-foreground">TP:</span>
                <span className="font-medium">${signal.takeProfit.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">R/R:</span>
                <span className="font-medium">{signal.riskReward.toFixed(1)}:1</span>
              </div>
            </div>

            <div className="flex space-x-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                Copy Trade
              </Button>
              <Button size="sm" variant="ghost">
                Details
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
