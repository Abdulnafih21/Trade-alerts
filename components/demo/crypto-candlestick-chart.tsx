"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Line } from "recharts"

// Generate realistic OHLC candlestick data
const generateCandlestickData = () => {
  const data = []
  let basePrice = 67000

  for (let i = 0; i < 50; i++) {
    const open = basePrice + (Math.random() - 0.5) * 200
    const volatility = 100 + Math.random() * 300
    const high = open + Math.random() * volatility
    const low = open - Math.random() * volatility
    const close = low + Math.random() * (high - low)
    const volume = Math.random() * 1000000 + 500000

    data.push({
      time: new Date(Date.now() - (49 - i) * 5 * 60 * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume: Math.round(volume),
      color: close >= open ? "#10b981" : "#ef4444",
    })

    basePrice = close
  }

  return data
}

const CustomCandlestick = ({ payload, x, y, width, height }: any) => {
  if (!payload) return null

  const { open, high, low, close } = payload
  const isGreen = close >= open
  const color = isGreen ? "#10b981" : "#ef4444"

  const bodyHeight = Math.abs(close - open)
  const bodyY = Math.min(close, open)

  return (
    <g>
      {/* Wick */}
      <line x1={x + width / 2} y1={high} x2={x + width / 2} y2={low} stroke={color} strokeWidth={1} />
      {/* Body */}
      <rect
        x={x + 1}
        y={bodyY}
        width={width - 2}
        height={Math.max(bodyHeight, 1)}
        fill={isGreen ? color : "transparent"}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  )
}

export function CryptoCandlestickChart() {
  const [data, setData] = useState(generateCandlestickData())

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)]
        const lastPrice = prev[prev.length - 1].close
        const open = lastPrice + (Math.random() - 0.5) * 50
        const volatility = 50 + Math.random() * 150
        const high = open + Math.random() * volatility
        const low = open - Math.random() * volatility
        const close = low + Math.random() * (high - low)

        newData.push({
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          open: Math.round(open),
          high: Math.round(high),
          low: Math.round(low),
          close: Math.round(close),
          volume: Math.round(Math.random() * 1000000 + 500000),
          color: close >= open ? "#10b981" : "#ef4444",
        })

        return newData
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-[var(--font-heading)] flex items-center justify-between">
          BTC/USDT Candlestick Chart
          <span className="text-sm font-normal text-muted-foreground">5m intervals</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              domain={["dataMin - 100", "dataMax + 100"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: any, name: string) => [
                typeof value === "number" ? `$${value.toLocaleString()}` : value,
                name.toUpperCase(),
              ]}
            />
            <Bar dataKey="volume" fill="hsl(var(--chart-3) / 0.3)" yAxisId="volume" maxBarSize={3} />
            {/* Custom candlestick rendering would go here - simplified for demo */}
            <Line type="monotone" dataKey="close" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
