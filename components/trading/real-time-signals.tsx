"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signalEngine, type Signal, type Strategy } from "@/lib/signal-engine"
import { TrendingUp, TrendingDown, Zap, Target, Clock } from "lucide-react"

export function RealTimeSignals() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string>("all")

  useEffect(() => {
    // Initialize with mock data and start real-time updates
    const initializeData = () => {
      // Simulate market data updates
      const symbols = ["BTCUSDT", "ETHUSDT", "SPY", "EURUSD"]

      symbols.forEach((symbol) => {
        // Generate initial historical data
        for (let i = 0; i < 50; i++) {
          const basePrice = symbol === "BTCUSDT" ? 67000 : symbol === "ETHUSDT" ? 3400 : symbol === "SPY" ? 445 : 1.087

          signalEngine.updateMarketData(symbol, {
            symbol,
            price: basePrice + (Math.random() - 0.5) * basePrice * 0.02,
            volume: Math.random() * 1000000,
            timestamp: Date.now() - (50 - i) * 60000,
            high: basePrice * (1 + Math.random() * 0.01),
            low: basePrice * (1 - Math.random() * 0.01),
            open: basePrice + (Math.random() - 0.5) * basePrice * 0.005,
            close: basePrice + (Math.random() - 0.5) * basePrice * 0.005,
          })
        }
      })

      setStrategies(signalEngine.getStrategies())
      setSignals(signalEngine.getSignalHistory(20))
    }

    initializeData()

    // Simulate real-time updates
    const interval = setInterval(() => {
      const symbols = ["BTCUSDT", "ETHUSDT", "SPY", "EURUSD"]
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]

      const basePrice =
        randomSymbol === "BTCUSDT" ? 67000 : randomSymbol === "ETHUSDT" ? 3400 : randomSymbol === "SPY" ? 445 : 1.087

      signalEngine.updateMarketData(randomSymbol, {
        symbol: randomSymbol,
        price: basePrice + (Math.random() - 0.5) * basePrice * 0.02,
        volume: Math.random() * 1000000,
        timestamp: Date.now(),
        high: basePrice * (1 + Math.random() * 0.01),
        low: basePrice * (1 - Math.random() * 0.01),
        open: basePrice + (Math.random() - 0.5) * basePrice * 0.005,
        close: basePrice + (Math.random() - 0.5) * basePrice * 0.005,
      })

      setSignals(signalEngine.getSignalHistory(20))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const filteredSignals =
    selectedStrategy === "all" ? signals : signals.filter((signal) => signal.strategyId === selectedStrategy)

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes("USD") && !symbol.includes("USDT")) {
      return price.toFixed(4)
    }
    return price.toLocaleString()
  }

  const getTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes === 1) return "1 min ago"
    return `${minutes} min ago`
  }

  const getMostActiveSymbol = () => {
    if (signals.length === 0) return "N/A"

    const symbolCounts: Record<string, number> = signals.reduce((acc, signal) => {
      acc[signal.symbol] = (acc[signal.symbol] || 0) + 1
      return acc
    }, {})

    const entries = Object.entries(symbolCounts)
    entries.sort(([, a], [, b]) => b - a)

    return entries[0]?.[0] || "N/A"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-[var(--font-heading)]">Real-Time Signal Feed</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
          <Button variant="outline" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Configure Alerts
          </Button>
        </div>
      </div>

      <Tabs defaultValue="signals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signals">Active Signals</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Performance</TabsTrigger>
          <TabsTrigger value="analytics">Signal Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium">Filter by Strategy:</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="px-3 py-1 rounded-md bg-input border border-border text-sm"
            >
              <option value="all">All Strategies</option>
              {strategies.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4">
            {filteredSignals.map((signal) => (
              <Card key={signal.id} className="bg-card border-border hover:bg-card/80 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {signal.side === "LONG" ? (
                          <TrendingUp className="h-6 w-6 text-chart-4" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-chart-2" />
                        )}
                        <Badge
                          variant={signal.side === "LONG" ? "default" : "destructive"}
                          className={`text-sm px-3 py-1 ${
                            signal.side === "LONG" ? "bg-chart-4 hover:bg-chart-4/80" : "bg-chart-2 hover:bg-chart-2/80"
                          }`}
                        >
                          {signal.side}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{signal.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{signal.reason.join(" • ")}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Strategy: {strategies.find((s) => s.id === signal.strategyId)?.name || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">${formatPrice(signal.price, signal.symbol)}</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={signal.confidence * 100} className="w-20" />
                        <span className="text-sm font-medium">{Math.round(signal.confidence * 100)}%</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeAgo(signal.timestamp)}
                      </div>
                      {signal.stopLoss && signal.takeProfit && (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>SL:</span>
                            <span className="text-chart-2">${formatPrice(signal.stopLoss, signal.symbol)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>TP:</span>
                            <span className="text-chart-4">${formatPrice(signal.takeProfit, signal.symbol)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredSignals.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Signals</h3>
                  <p className="text-muted-foreground">Waiting for market conditions to meet strategy criteria...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid gap-4">
            {strategies.map((strategy) => (
              <Card key={strategy.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-[var(--font-heading)]">{strategy.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                      <p className="text-xs text-muted-foreground">by {strategy.author}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {strategy.type.replace("-", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-chart-4">
                        {(strategy.performance.winRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {strategy.performance.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-chart-3">
                        {(strategy.performance.avgReturn * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Return</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{strategy.performance.totalSignals.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Signals</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Signal Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>LONG Signals</span>
                    <span className="font-semibold text-chart-4">
                      {signals.filter((s) => s.side === "LONG").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>SHORT Signals</span>
                    <span className="font-semibold text-chart-2">
                      {signals.filter((s) => s.side === "SHORT").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Active</span>
                    <span className="font-semibold">{signals.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Avg Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {signals.length > 0
                    ? Math.round((signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length) * 100)
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground mt-2">Across all active signals</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Most Active Symbol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getMostActiveSymbol()}</div>
                <p className="text-sm text-muted-foreground mt-2">Generating most signals</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
