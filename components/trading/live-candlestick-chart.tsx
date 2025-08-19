"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line } from "recharts"
import { binanceAPI, POPULAR_SYMBOLS } from "@/lib/binance-api"
import { tradingSignalsEngine } from "@/lib/trading-signals"

interface CandleData {
  time: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  rsi?: number
  ema9?: number
  ema21?: number
}

export function LiveCandlestickChart() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const [candleData, setCandleData] = useState<CandleData[]>([])
  const [indicators, setIndicators] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch historical candlestick data
        const historicalData = await binanceAPI.getHistoricalData(selectedSymbol, "1h", 100)

        if (historicalData.length === 0) {
          throw new Error("No data available")
        }

        // Convert to chart format
        const chartData: CandleData[] = historicalData.map((candle) => ({
          time: new Date(candle.openTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          timestamp: candle.openTime,
          open: Number.parseFloat(candle.open),
          high: Number.parseFloat(candle.high),
          low: Number.parseFloat(candle.low),
          close: Number.parseFloat(candle.close),
          volume: Number.parseFloat(candle.volume),
        }))

        setCandleData(chartData)

        // Get technical indicators
        const techIndicators = await tradingSignalsEngine.getTechnicalIndicators(selectedSymbol)
        setIndicators(techIndicators)
      } catch (err) {
        console.error("Error fetching chart data:", err)
        setError("Failed to load chart data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time updates
    const cleanup = binanceAPI.subscribeToPrice(selectedSymbol, (data) => {
      setCandleData((prev) => {
        if (prev.length === 0) return prev

        const newData = [...prev]
        const lastCandle = newData[newData.length - 1]

        // Update the last candle with new price
        lastCandle.close = Number.parseFloat(data.price)
        lastCandle.high = Math.max(lastCandle.high, lastCandle.close)
        lastCandle.low = Math.min(lastCandle.low, lastCandle.close)

        return newData
      })
    })

    return cleanup
  }, [selectedSymbol])

  const formatPrice = (value: number) => {
    return selectedSymbol.includes("USDT") ? (value > 1 ? value.toFixed(2) : value.toFixed(4)) : value.toFixed(4)
  }

  const formatVolume = (value: number) => {
    if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value > 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(0)
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Live Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Live Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  const currentPrice = candleData.length > 0 ? candleData[candleData.length - 1].close : 0
  const priceChange =
    candleData.length > 1
      ? ((currentPrice - candleData[candleData.length - 2].close) / candleData[candleData.length - 2].close) * 100
      : 0

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle>Live Chart</CardTitle>
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-32">
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
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">${formatPrice(currentPrice)}</div>
              <Badge
                variant={priceChange >= 0 ? "default" : "destructive"}
                className={priceChange >= 0 ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={candleData.slice(-50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                yAxisId="price"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={formatPrice}
              />
              <YAxis
                yAxisId="volume"
                orientation="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={formatVolume}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any, name: string) => {
                  if (name === "volume") return [formatVolume(value), "Volume"]
                  return [formatPrice(value), name]
                }}
              />
              <Bar yAxisId="volume" dataKey="volume" fill="hsl(var(--muted))" opacity={0.3} />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="high"
                stroke="hsl(var(--chart-4))"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="low"
                stroke="hsl(var(--chart-2))"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {indicators && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-muted-foreground">RSI</div>
              <div
                className={`font-semibold ${indicators.rsi > 70 ? "text-red-500" : indicators.rsi < 30 ? "text-green-500" : ""}`}
              >
                {indicators.rsi.toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">EMA 9</div>
              <div className="font-semibold">${formatPrice(indicators.ema9)}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">EMA 21</div>
              <div className="font-semibold">${formatPrice(indicators.ema21)}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">MACD</div>
              <div className={`font-semibold ${indicators.macd.histogram > 0 ? "text-green-500" : "text-red-500"}`}>
                {indicators.macd.macd.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
