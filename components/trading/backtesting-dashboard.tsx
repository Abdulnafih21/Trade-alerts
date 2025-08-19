"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import { backtestingEngine, type BacktestConfig, type BacktestResults } from "@/lib/backtesting-engine"
import { POPULAR_SYMBOLS } from "@/lib/binance-api"
import {
  Play,
  Settings,
  Download,
  Share2,
  TrendingUp,
  Target,
  AlertTriangle,
  Percent,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"

export function BacktestingDashboard() {
  const [activeTab, setActiveTab] = useState("configure")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BacktestResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<BacktestConfig>({
    strategyId: "momentum-scalper",
    symbol: "BTCUSDT",
    startDate: "2024-01-01",
    endDate: "2024-08-17",
    initialCapital: 100000,
    timeframe: "1h",
    commission: 0.001,
    slippage: 0.0005,
    maxPositions: 1,
    riskPerTrade: 0.02,
  })

  const runBacktest = async () => {
    setIsRunning(true)
    setProgress(0)
    setError(null)
    setActiveTab("results")

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 10
      })
    }, 500)

    try {
      console.log("[v0] Starting backtest with config:", config)
      const backtestResults = await backtestingEngine.runBacktest(config)
      console.log("[v0] Backtest completed:", backtestResults)

      setResults(backtestResults)
      setProgress(100)
    } catch (error) {
      console.error("[v0] Backtest failed:", error)
      setError(error instanceof Error ? error.message : "Backtest failed")
    } finally {
      setIsRunning(false)
      clearInterval(progressInterval)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const formatNumber = (value: number, decimals = 2) => {
    return value.toFixed(decimals)
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? "text-chart-4" : "text-chart-2"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-[var(--font-heading)]">Backtesting Engine</h2>
          <p className="text-muted-foreground">Test your strategies against real historical market data</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled={!results}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline" size="sm" disabled={!results}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Configuration */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-[var(--font-heading)]">Strategy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="strategy">Strategy</Label>
                  <Select
                    value={config.strategyId}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, strategyId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="momentum-scalper">Momentum Scalper</SelectItem>
                      <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                      <SelectItem value="breakout-hunter">Breakout Hunter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select
                    value={config.symbol}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, symbol: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_SYMBOLS.map((symbol) => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol.replace("USDT", "/USDT")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select
                    value={config.timeframe}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, timeframe: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={config.startDate}
                      onChange={(e) => setConfig((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={config.endDate}
                      onChange={(e) => setConfig((prev) => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk & Execution Settings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-[var(--font-heading)]">Risk & Execution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="initial-capital">Initial Capital ($)</Label>
                  <Input
                    id="initial-capital"
                    type="number"
                    value={config.initialCapital}
                    onChange={(e) => setConfig((prev) => ({ ...prev, initialCapital: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="risk-per-trade">Risk per Trade (%)</Label>
                  <Input
                    id="risk-per-trade"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="0.1"
                    value={config.riskPerTrade}
                    onChange={(e) => setConfig((prev) => ({ ...prev, riskPerTrade: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="commission">Commission (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.0001"
                    value={config.commission}
                    onChange={(e) => setConfig((prev) => ({ ...prev, commission: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="slippage">Slippage (%)</Label>
                  <Input
                    id="slippage"
                    type="number"
                    step="0.0001"
                    value={config.slippage}
                    onChange={(e) => setConfig((prev) => ({ ...prev, slippage: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="max-positions">Max Positions</Label>
                  <Input
                    id="max-positions"
                    type="number"
                    min="1"
                    max="10"
                    value={config.maxPositions}
                    onChange={(e) => setConfig((prev) => ({ ...prev, maxPositions: Number(e.target.value) }))}
                  />
                </div>

                <Button onClick={runBacktest} disabled={isRunning} className="w-full bg-primary hover:bg-primary/90">
                  {isRunning ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Running Backtest...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Backtest
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {isRunning && (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Activity className="h-6 w-6 animate-spin text-primary" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {progress < 30
                          ? "Fetching historical data..."
                          : progress < 60
                            ? "Calculating indicators..."
                            : progress < 90
                              ? "Running strategy simulation..."
                              : "Finalizing results..."}
                      </span>
                      <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="bg-card border-border border-destructive">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">Backtest Failed</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {results && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                    <TrendingUp className="h-4 w-4 text-chart-4" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getPerformanceColor(results.performance.totalReturn)}`}>
                      {formatPercent(results.performance.totalReturn)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(results.performance.totalReturn * config.initialCapital)} profit
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
                    <Target className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(results.performance.sharpeRatio)}</div>
                    <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <Percent className="h-4 w-4 text-chart-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercent(results.performance.winRate)}</div>
                    <p className="text-xs text-muted-foreground">
                      {results.performance.winningTrades} of {results.performance.totalTrades} trades
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-chart-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-2">
                      {formatPercent(results.performance.maxDrawdown)}
                    </div>
                    <p className="text-xs text-muted-foreground">Maximum loss from peak</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-[var(--font-heading)]">Equity Curve</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={results.equity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => [formatCurrency(value), "Equity"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="equity"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1) / 0.2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-[var(--font-heading)]">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Annualized Return</span>
                        <span className={`font-semibold ${getPerformanceColor(results.performance.annualizedReturn)}`}>
                          {formatPercent(results.performance.annualizedReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit Factor</span>
                        <span className="font-semibold">{formatNumber(results.performance.profitFactor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sortino Ratio</span>
                        <span className="font-semibold">{formatNumber(results.performance.sortinoRatio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calmar Ratio</span>
                        <span className="font-semibold">{formatNumber(results.performance.calmarRatio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recovery Factor</span>
                        <span className="font-semibold">{formatNumber(results.performance.recoveryFactor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payoff Ratio</span>
                        <span className="font-semibold">{formatNumber(results.performance.payoffRatio)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-[var(--font-heading)]">Trade Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Trades</span>
                        <span className="font-semibold">{results.performance.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Win</span>
                        <span className="font-semibold text-chart-4">{formatCurrency(results.performance.avgWin)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Loss</span>
                        <span className="font-semibold text-chart-2">
                          {formatCurrency(results.performance.avgLoss)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Largest Win</span>
                        <span className="font-semibold text-chart-4">
                          {formatCurrency(results.performance.largestWin)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Largest Loss</span>
                        <span className="font-semibold text-chart-2">
                          {formatCurrency(results.performance.largestLoss)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expectancy</span>
                        <span className={`font-semibold ${getPerformanceColor(results.performance.expectancy)}`}>
                          {formatCurrency(results.performance.expectancy)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-[var(--font-heading)]">Recent Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.trades
                      .slice(-10)
                      .reverse()
                      .map((trade) => (
                        <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${trade.pnl > 0 ? "bg-green-500" : "bg-red-500"}`} />
                            <div>
                              <div className="font-medium">{trade.symbol.replace("USDT", "/USDT")}</div>
                              <div className="text-sm text-muted-foreground">{trade.side}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${trade.pnl > 0 ? "text-green-500" : "text-red-500"}`}>
                              {formatCurrency(trade.pnl)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(trade.exitTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!results && !isRunning && !error && (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your backtest parameters and run a simulation to see results
                </p>
                <Button onClick={() => setActiveTab("configure")} className="bg-primary hover:bg-primary/90">
                  Configure Backtest
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ... existing code for analysis and optimization tabs ... */}
        <TabsContent value="analysis" className="space-y-6">
          {results ? (
            <>
              {/* Drawdown Chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-[var(--font-heading)]">Drawdown Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={results.equity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatPercent(value)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => [formatPercent(value), "Drawdown"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="drawdown"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2) / 0.2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Returns */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-[var(--font-heading)]">Monthly Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={results.monthlyReturns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `Month ${value + 1}`}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatPercent(value)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatPercent(value), "Return"]}
                      />
                      <Bar dataKey="return" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Risk Metrics */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-[var(--font-heading)]">Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/20">
                      <div className="text-2xl font-bold text-chart-2">{formatPercent(results.riskMetrics.var95)}</div>
                      <div className="text-sm text-muted-foreground">VaR 95%</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/20">
                      <div className="text-2xl font-bold text-chart-2">{formatPercent(results.riskMetrics.var99)}</div>
                      <div className="text-sm text-muted-foreground">VaR 99%</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/20">
                      <div className="text-2xl font-bold">{formatNumber(results.riskMetrics.beta)}</div>
                      <div className="text-sm text-muted-foreground">Beta</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/20">
                      <div className="text-2xl font-bold">{formatPercent(results.riskMetrics.alpha)}</div>
                      <div className="text-sm text-muted-foreground">Alpha</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/20">
                      <div className="text-2xl font-bold">{formatNumber(results.riskMetrics.informationRatio)}</div>
                      <div className="text-sm text-muted-foreground">Information Ratio</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/20">
                      <div className="text-2xl font-bold">{formatPercent(results.riskMetrics.trackingError)}</div>
                      <div className="text-sm text-muted-foreground">Tracking Error</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <PieChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Analysis Available</h3>
                <p className="text-muted-foreground">Run a backtest to see detailed analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Parameter Optimization</h3>
              <p className="text-muted-foreground mb-4">
                Optimize strategy parameters using walk-forward analysis and genetic algorithms
              </p>
              <Button className="bg-primary hover:bg-primary/90" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
