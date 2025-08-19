"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { tradingSignalsEngine, type TradingSignal } from "@/lib/trading-signals"
import { POPULAR_SYMBOLS } from "@/lib/binance-api"
import { TrendingUp, TrendingDown, Zap, Target, Clock, Filter, RefreshCw } from "lucide-react"

interface SignalWithId extends TradingSignal {
  id: string
  created_at: string
}

export function RealTimeSignals() {
  const [signals, setSignals] = useState<SignalWithId[]>([])
  const [filteredSignals, setFilteredSignals] = useState<SignalWithId[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>("all")
  const [selectedStrategy, setSelectedStrategy] = useState<string>("all")
  const [selectedSignalType, setSelectedSignalType] = useState<string>("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [signalStats, setSignalStats] = useState({
    totalSignals: 0,
    longSignals: 0,
    shortSignals: 0,
    avgConfidence: 0,
    mostActiveSymbol: "N/A",
  })

  const loadSignalsFromDatabase = async () => {
    try {
      const signals = await tradingSignalsEngine.getRecentSignals(50)
      const signalsWithId = signals.map((signal, index) => ({
        ...signal,
        id: signal.id || `signal-${index}`,
        created_at: signal.created_at || new Date().toISOString(),
      }))

      setSignals(signalsWithId)
      setLastUpdate(new Date())

      // Calculate stats
      const stats = {
        totalSignals: signalsWithId.length,
        longSignals: signalsWithId.filter((s) => s.signal_type === "LONG").length,
        shortSignals: signalsWithId.filter((s) => s.signal_type === "SHORT").length,
        avgConfidence:
          signalsWithId.length > 0 ? signalsWithId.reduce((sum, s) => sum + s.confidence, 0) / signalsWithId.length : 0,
        mostActiveSymbol: getMostActiveSymbol(signalsWithId),
      }
      setSignalStats(stats)
    } catch (error) {
      console.error("Error loading signals:", error)
    }
  }

  const generateRealTimeSignals = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    try {
      // Generate signals for popular symbols
      for (const symbol of POPULAR_SYMBOLS.slice(0, 4)) {
        const signal = await tradingSignalsEngine.generateSignal(symbol)
        if (signal && signal.signal_type !== "FLAT") {
          const saved = await tradingSignalsEngine.saveSignal(signal)
          if (saved) {
            console.log(`Generated ${signal.signal_type} signal for ${symbol}`)
          }
        }
      }

      // Reload signals from database
      await loadSignalsFromDatabase()
    } catch (error) {
      console.error("Error generating signals:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getMostActiveSymbol = (signalList: SignalWithId[]) => {
    if (signalList.length === 0) return "N/A"

    const symbolCounts: Record<string, number> = signalList.reduce((acc, signal) => {
      acc[signal.symbol] = (acc[signal.symbol] || 0) + 1
      return acc
    }, {})

    const entries = Object.entries(symbolCounts)
    entries.sort(([, a], [, b]) => b - a)

    return entries[0]?.[0] || "N/A"
  }

  useEffect(() => {
    let filtered = signals

    if (selectedSymbol !== "all") {
      filtered = filtered.filter((signal) => signal.symbol === selectedSymbol)
    }

    if (selectedStrategy !== "all") {
      filtered = filtered.filter((signal) => signal.strategy_name === selectedStrategy)
    }

    if (selectedSignalType !== "all") {
      filtered = filtered.filter((signal) => signal.signal_type === selectedSignalType)
    }

    setFilteredSignals(filtered)
  }, [signals, selectedSymbol, selectedStrategy, selectedSignalType])

  useEffect(() => {
    loadSignalsFromDatabase()

    // Set up periodic signal generation and refresh
    const signalInterval = setInterval(generateRealTimeSignals, 30000) // Generate every 30 seconds
    const refreshInterval = setInterval(loadSignalsFromDatabase, 10000) // Refresh every 10 seconds

    return () => {
      clearInterval(signalInterval)
      clearInterval(refreshInterval)
    }
  }, [])

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes("USD") && !symbol.includes("USDT")) {
      return price.toFixed(4)
    }
    return price > 1 ? price.toFixed(2) : price.toFixed(4)
  }

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes === 1) return "1 min ago"
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return "1 hour ago"
    if (hours < 24) return `${hours} hours ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const uniqueStrategies = Array.from(new Set(signals.map((s) => s.strategy_name)))
  const uniqueSymbols = Array.from(new Set(signals.map((s) => s.symbol)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-[var(--font-heading)]">Real-Time Signal Feed</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
          <Button variant="outline" size="sm" onClick={generateRealTimeSignals} disabled={isGenerating}>
            {isGenerating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            {isGenerating ? "Generating..." : "Generate Signals"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="signals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signals">Active Signals ({filteredSignals.length})</TabsTrigger>
          <TabsTrigger value="analytics">Signal Analytics</TabsTrigger>
          <TabsTrigger value="history">Signal History</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Symbol</label>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Symbols</SelectItem>
                      {uniqueSymbols.map((symbol) => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol.replace("USDT", "/USDT")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Strategy</label>
                  <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Strategies</SelectItem>
                      {uniqueStrategies.map((strategy) => (
                        <SelectItem key={strategy} value={strategy}>
                          {strategy}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Signal Type</label>
                  <Select value={selectedSignalType} onValueChange={setSelectedSignalType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="LONG">LONG</SelectItem>
                      <SelectItem value="SHORT">SHORT</SelectItem>
                      <SelectItem value="FLAT">FLAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Last Updated</label>
                  <div className="text-sm text-muted-foreground pt-2">{lastUpdate.toLocaleTimeString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredSignals.map((signal) => (
              <Card key={signal.id} className="bg-card border-border hover:bg-card/80 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {signal.signal_type === "LONG" ? (
                          <TrendingUp className="h-6 w-6 text-chart-4" />
                        ) : signal.signal_type === "SHORT" ? (
                          <TrendingDown className="h-6 w-6 text-chart-2" />
                        ) : (
                          <Target className="h-6 w-6 text-muted-foreground" />
                        )}
                        <Badge
                          variant={
                            signal.signal_type === "LONG"
                              ? "default"
                              : signal.signal_type === "SHORT"
                                ? "destructive"
                                : "secondary"
                          }
                          className={`text-sm px-3 py-1 ${
                            signal.signal_type === "LONG"
                              ? "bg-chart-4 hover:bg-chart-4/80"
                              : signal.signal_type === "SHORT"
                                ? "bg-chart-2 hover:bg-chart-2/80"
                                : "bg-muted"
                          }`}
                        >
                          {signal.signal_type}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{signal.symbol.replace("USDT", "/USDT")}</h3>
                        <p className="text-sm text-muted-foreground">{signal.reasoning}</p>
                        <p className="text-xs text-muted-foreground mt-1">Strategy: {signal.strategy_name}</p>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">${formatPrice(signal.entry_price, signal.symbol)}</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={signal.confidence} className="w-20" />
                        <span className="text-sm font-medium">{Math.round(signal.confidence)}%</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeAgo(signal.created_at)}
                      </div>
                      {signal.stop_loss && signal.take_profit && (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>SL:</span>
                            <span className="text-chart-2">${formatPrice(signal.stop_loss, signal.symbol)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>TP:</span>
                            <span className="text-chart-4">${formatPrice(signal.take_profit, signal.symbol)}</span>
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
                  <h3 className="text-lg font-semibold mb-2">No Signals Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {signals.length === 0
                      ? "No signals generated yet. Click 'Generate Signals' to create new ones."
                      : "No signals match your current filters. Try adjusting the filter criteria."}
                  </p>
                  <Button onClick={generateRealTimeSignals} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate New Signals"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Total Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{signalStats.totalSignals}</div>
                <p className="text-sm text-muted-foreground mt-2">Generated signals</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Signal Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>LONG</span>
                    <span className="font-semibold text-chart-4">{signalStats.longSignals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SHORT</span>
                    <span className="font-semibold text-chart-2">{signalStats.shortSignals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Avg Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{Math.round(signalStats.avgConfidence)}%</div>
                <p className="text-sm text-muted-foreground mt-2">Across all signals</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Most Active Symbol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{signalStats.mostActiveSymbol.replace("USDT", "/USDT")}</div>
                <p className="text-sm text-muted-foreground mt-2">Most signals generated</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Strategy Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uniqueStrategies.map((strategy) => {
                  const strategySignals = signals.filter((s) => s.strategy_name === strategy)
                  const avgConfidence =
                    strategySignals.length > 0
                      ? strategySignals.reduce((sum, s) => sum + s.confidence, 0) / strategySignals.length
                      : 0

                  return (
                    <div key={strategy} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <h4 className="font-semibold">{strategy}</h4>
                        <p className="text-sm text-muted-foreground">{strategySignals.length} signals</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{Math.round(avgConfidence)}%</div>
                        <div className="text-sm text-muted-foreground">Avg Confidence</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Signal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {signals.slice(0, 10).map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          signal.signal_type === "LONG"
                            ? "default"
                            : signal.signal_type === "SHORT"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {signal.signal_type}
                      </Badge>
                      <span className="font-medium">{signal.symbol.replace("USDT", "/USDT")}</span>
                      <span className="text-sm text-muted-foreground">{signal.strategy_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${formatPrice(signal.entry_price, signal.symbol)}</div>
                      <div className="text-xs text-muted-foreground">{getTimeAgo(signal.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
