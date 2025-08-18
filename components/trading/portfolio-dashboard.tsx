"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { signalEngine, type PortfolioStats, type PortfolioPosition, type RealTimePrice } from "@/lib/signal-engine"
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, Activity } from "lucide-react"

export function PortfolioDashboard() {
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null)
  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [realTimePrices, setRealTimePrices] = useState<RealTimePrice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateData = () => {
      try {
        setPortfolioStats(signalEngine.getPortfolioStats())
        setPositions(signalEngine.getPortfolioPositions())
        setRealTimePrices(signalEngine.getRealTimePrices())
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error updating portfolio data:", error)
      }
    }

    updateData()
    const interval = setInterval(updateData, 2000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  $
                  {portfolioStats?.totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                <p
                  className={`text-2xl font-bold ${portfolioStats && portfolioStats.totalPnL >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {portfolioStats && portfolioStats.totalPnL >= 0 ? "+" : ""}$
                  {portfolioStats?.totalPnL.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={`text-sm ${portfolioStats && portfolioStats.totalPnLPercent >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {portfolioStats && portfolioStats.totalPnLPercent >= 0 ? "+" : ""}
                  {portfolioStats?.totalPnLPercent.toFixed(2)}%
                </p>
              </div>
              {portfolioStats && portfolioStats.totalPnL >= 0 ? (
                <TrendingUp className="h-8 w-8 text-success" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Day P&L</p>
                <p
                  className={`text-2xl font-bold ${portfolioStats && portfolioStats.dayPnL >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {portfolioStats && portfolioStats.dayPnL >= 0 ? "+" : ""}$
                  {portfolioStats?.dayPnL.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={`text-sm ${portfolioStats && portfolioStats.dayPnLPercent >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {portfolioStats && portfolioStats.dayPnLPercent >= 0 ? "+" : ""}
                  {portfolioStats?.dayPnLPercent.toFixed(2)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-foreground">{portfolioStats?.winRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">{portfolioStats?.openPositions} open positions</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positions">Open Positions</TabsTrigger>
          <TabsTrigger value="prices">Live Prices</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions ({positions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No open positions</p>
                  <p className="text-sm">Positions will appear here when signals are generated</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant={position.side === "LONG" ? "default" : "secondary"}>{position.side}</Badge>
                        <div>
                          <p className="font-medium">{position.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            Entry: ${position.entryPrice.toFixed(4)} | Current: ${position.currentPrice.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${position.unrealizedPnL >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          {position.unrealizedPnL >= 0 ? "+" : ""}${position.unrealizedPnL.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {((position.unrealizedPnL / (position.entryPrice * position.quantity)) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Market Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {realTimePrices.map((price) => (
                  <div key={price.symbol} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{price.symbol}</h3>
                      <Badge variant={price.changePercent24h >= 0 ? "default" : "destructive"}>
                        {price.changePercent24h >= 0 ? "+" : ""}
                        {price.changePercent24h.toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      $
                      {price.price.toLocaleString(undefined, {
                        minimumFractionDigits: price.symbol.includes("USD") && !price.symbol.includes("USDT") ? 4 : 2,
                        maximumFractionDigits: price.symbol.includes("USD") && !price.symbol.includes("USDT") ? 4 : 2,
                      })}
                    </p>
                    <p className={`text-sm ${price.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                      {price.change24h >= 0 ? "+" : ""}${price.change24h.toFixed(2)} (24h)
                    </p>
                    {price.volume24h > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Vol: ${(price.volume24h / 1000000).toFixed(1)}M
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sharpe Ratio</span>
                  <span className="font-bold">{portfolioStats?.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Max Drawdown</span>
                  <span className="font-bold text-destructive">-{portfolioStats?.maxDrawdown.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg Win</span>
                  <span className="font-bold text-success">+${portfolioStats?.avgWin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg Loss</span>
                  <span className="font-bold text-destructive">${portfolioStats?.avgLoss.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Portfolio Risk</span>
                    <span className="text-sm">Medium</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Diversification</span>
                    <span className="text-sm">Good</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="flex items-center space-x-2 p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <p className="text-sm">Monitor crypto exposure levels</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
