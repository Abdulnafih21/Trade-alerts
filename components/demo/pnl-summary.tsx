"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, AlertTriangle } from "lucide-react"

interface PnLData {
  totalPnL: number
  dailyPnL: number
  winRate: number
  totalTrades: number
  activePositions: number
  accountBalance: number
  dayChange: number
  weekChange: number
  monthChange: number
}

export function PnLSummary() {
  const [pnlData, setPnlData] = useState<PnLData>({
    totalPnL: 12847.32,
    dailyPnL: 234.56,
    winRate: 68.4,
    totalTrades: 127,
    activePositions: 3,
    accountBalance: 25000,
    dayChange: 0.94,
    weekChange: 3.2,
    monthChange: 15.7,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setPnlData((prev) => ({
        ...prev,
        dailyPnL: prev.dailyPnL + (Math.random() - 0.5) * 50,
        totalPnL: prev.totalPnL + (Math.random() - 0.5) * 25,
        dayChange: prev.dayChange + (Math.random() - 0.5) * 0.1,
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-[var(--font-heading)] flex items-center justify-between">
          Portfolio Summary
          <Badge variant="outline" className="text-xs">
            Live Trading
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main PnL Display */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold flex items-center justify-center space-x-2">
            <DollarSign className="w-6 h-6 text-muted-foreground" />
            <span className={pnlData.totalPnL >= 0 ? "text-green-500" : "text-red-500"}>
              {formatCurrency(pnlData.totalPnL)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">Total P&L</div>
          <div className="flex items-center justify-center space-x-2">
            {pnlData.dayChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${pnlData.dayChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatPercent(pnlData.dayChange)} today
            </span>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Daily P&L</span>
            </div>
            <div className={`text-lg font-semibold ${pnlData.dailyPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(pnlData.dailyPnL)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Win Rate</span>
            </div>
            <div className="text-lg font-semibold text-foreground">{pnlData.winRate.toFixed(1)}%</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Trades</span>
            </div>
            <div className="text-lg font-semibold text-foreground">{pnlData.totalTrades}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Positions</span>
            </div>
            <div className="text-lg font-semibold text-foreground">{pnlData.activePositions}</div>
          </div>
        </div>

        {/* Performance Timeline */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Performance Timeline</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">1D</div>
              <div className={`text-sm font-medium ${pnlData.dayChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatPercent(pnlData.dayChange)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">1W</div>
              <div className={`text-sm font-medium ${pnlData.weekChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatPercent(pnlData.weekChange)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">1M</div>
              <div className={`text-sm font-medium ${pnlData.monthChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatPercent(pnlData.monthChange)}
              </div>
            </div>
          </div>
        </div>

        {/* Account Balance */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account Balance</span>
            <span className="text-lg font-semibold text-foreground">
              {formatCurrency(pnlData.accountBalance + pnlData.totalPnL)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
