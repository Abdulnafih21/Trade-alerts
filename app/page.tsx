"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import { RealTimeSignals } from "@/components/trading/real-time-signals"
import { StrategyStudio } from "@/components/trading/strategy-studio"
import { CommunityHub } from "@/components/trading/community-hub"
import { BacktestingDashboard } from "@/components/trading/backtesting-dashboard"
import AlertDashboard from "@/components/trading/alert-dashboard"
import { TestingDashboard } from "@/components/trading/testing-dashboard"
import { PortfolioDashboard } from "@/components/trading/portfolio-dashboard"
import { TrendingUp, TrendingDown, Activity, Bell, Settings, Signal } from "lucide-react"

// Mock data for real-time trading
const generateMockData = () => ({
  btc: 67234 + (Math.random() - 0.5) * 1000,
  eth: 3456 + (Math.random() - 0.5) * 100,
  spy: 445.67 + (Math.random() - 0.5) * 10,
  eurusd: 1.0876 + (Math.random() - 0.5) * 0.01,
  timestamp: Date.now(),
})

const chartData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  btc: 67000 + Math.random() * 2000,
  eth: 3400 + Math.random() * 200,
  volume: Math.random() * 1000000,
}))

const signals = [
  {
    id: 1,
    symbol: "BTCUSDT",
    side: "LONG",
    confidence: 0.87,
    price: 67234,
    time: "2 min ago",
    reason: "EMA crossover + volume spike",
  },
  {
    id: 2,
    symbol: "ETHUSDT",
    side: "SHORT",
    confidence: 0.72,
    price: 3456,
    time: "5 min ago",
    reason: "RSI overbought + resistance",
  },
  {
    id: 3,
    symbol: "SPY",
    side: "LONG",
    confidence: 0.91,
    price: 445.67,
    time: "8 min ago",
    reason: "Breakout + institutional flow",
  },
  {
    id: 4,
    symbol: "EURUSD",
    side: "SHORT",
    confidence: 0.68,
    price: 1.0876,
    time: "12 min ago",
    reason: "News sentiment + technical",
  },
]

const topStrategies = [
  { name: "Momentum Scalper", author: "TradingPro", sharpe: 2.34, returns: "+127.5%", subscribers: 1247 },
  { name: "Mean Reversion", author: "QuantMaster", sharpe: 1.89, returns: "+89.2%", subscribers: 892 },
  { name: "Breakout Hunter", author: "AlgoTrader", sharpe: 2.01, returns: "+156.8%", subscribers: 2103 },
  { name: "News Sentiment", author: "AISignals", sharpe: 1.67, returns: "+73.4%", subscribers: 567 },
]

export default function TradingDashboard() {
  const [liveData, setLiveData] = useState(generateMockData())
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(generateMockData())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Signal className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-[var(--font-heading)]">TradingSignals Pro</h1>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              LIVE
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90">Upgrade Pro</Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 bg-transparent">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="signals"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Signals
              </TabsTrigger>
              <TabsTrigger
                value="strategies"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Strategies
              </TabsTrigger>
              <TabsTrigger
                value="backtest"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Backtest
              </TabsTrigger>
              <TabsTrigger
                value="community"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Community
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Alerts
              </TabsTrigger>
              <TabsTrigger
                value="testing"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Testing
              </TabsTrigger>
              <TabsTrigger
                value="portfolio"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Portfolio
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      <main className="p-6">
        <Tabs value={activeTab} className="w-full">
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Market Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">BTC/USDT</CardTitle>
                  <TrendingUp className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${liveData.btc.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+2.34% from yesterday</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ETH/USDT</CardTitle>
                  <TrendingDown className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${liveData.eth.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">-1.23% from yesterday</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SPY</CardTitle>
                  <Activity className="h-4 w-4 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${liveData.spy.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">+0.87% from yesterday</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">EUR/USD</CardTitle>
                  <TrendingUp className="h-4 w-4 text-chart-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{liveData.eurusd.toFixed(4)}</div>
                  <p className="text-xs text-muted-foreground">+0.45% from yesterday</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-[var(--font-heading)]">Price Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="btc"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1) / 0.2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-[var(--font-heading)]">Volume Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="volume" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Signals */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-[var(--font-heading)]">Recent Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signals.slice(0, 3).map((signal) => (
                    <div key={signal.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={signal.side === "LONG" ? "default" : "destructive"}
                          className={
                            signal.side === "LONG" ? "bg-chart-4 hover:bg-chart-4/80" : "bg-chart-2 hover:bg-chart-2/80"
                          }
                        >
                          {signal.side}
                        </Badge>
                        <div>
                          <div className="font-semibold">{signal.symbol}</div>
                          <div className="text-sm text-muted-foreground">{signal.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${signal.price.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(signal.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <RealTimeSignals />
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <StrategyStudio />
          </TabsContent>

          {/* Backtest Tab */}
          <TabsContent value="backtest" className="space-y-6">
            <BacktestingDashboard />
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <CommunityHub />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <AlertDashboard />
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <TestingDashboard />
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
