"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { binanceAPI, POPULAR_SYMBOLS } from "@/lib/binance-api"

interface MarketData {
  symbol: string
  price: string
  priceChange: string
  priceChangePercent: string
  volume: string
  lastUpdate: number
}

export function LiveMarketData() {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateMarketData = useCallback((symbol: string, data: any) => {
    setMarketData((prev) => ({
      ...prev,
      [symbol]: {
        symbol,
        price: data.price || data.c,
        priceChange: data.priceChange || data.P,
        priceChangePercent: data.priceChangePercent || data.P,
        volume: data.volume || data.v,
        lastUpdate: Date.now(),
      },
    }))
  }, [])

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = []

    const initializeMarketData = async () => {
      try {
        // Get initial data for all symbols
        const initialData = await binanceAPI.getMultipleSymbolsData(POPULAR_SYMBOLS)

        if (initialData.length > 0) {
          const dataMap: Record<string, MarketData> = {}
          initialData.forEach((ticker) => {
            dataMap[ticker.symbol] = {
              symbol: ticker.symbol,
              price: ticker.price,
              priceChange: ticker.priceChange,
              priceChangePercent: ticker.priceChangePercent,
              volume: ticker.volume,
              lastUpdate: Date.now(),
            }
          })
          setMarketData(dataMap)
          setIsConnected(true)
          setError(null)

          // Subscribe to real-time updates for each symbol
          POPULAR_SYMBOLS.forEach((symbol) => {
            const cleanup = binanceAPI.subscribeToPrice(symbol, (data) => {
              updateMarketData(symbol, data)
            })
            cleanupFunctions.push(cleanup)
          })
        }
      } catch (err) {
        console.error("Failed to initialize market data:", err)
        setError("Failed to connect to market data")
        setIsConnected(false)
      }
    }

    initializeMarketData()

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
      binanceAPI.closeAllConnections()
    }
  }, [updateMarketData])

  const formatPrice = (price: string, symbol: string) => {
    const numPrice = Number.parseFloat(price)
    if (symbol.includes("USDT")) {
      return numPrice > 1 ? numPrice.toFixed(2) : numPrice.toFixed(4)
    }
    return numPrice.toFixed(4)
  }

  const formatVolume = (volume: string) => {
    const numVolume = Number.parseFloat(volume)
    if (numVolume > 1000000) {
      return `${(numVolume / 1000000).toFixed(1)}M`
    }
    if (numVolume > 1000) {
      return `${(numVolume / 1000).toFixed(1)}K`
    }
    return numVolume.toFixed(0)
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Market Data</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {POPULAR_SYMBOLS.map((symbol) => {
          const data = marketData[symbol]
          if (!data) {
            return (
              <Card key={symbol} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-20 mb-2" />
                    <div className="h-6 bg-muted rounded w-24 mb-1" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </CardContent>
              </Card>
            )
          }

          const priceChangeNum = Number.parseFloat(data.priceChangePercent)
          const isPositive = priceChangeNum >= 0

          return (
            <Card key={symbol} className="bg-card border-border hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{symbol.replace("USDT", "/USDT")}</CardTitle>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${formatPrice(data.price, symbol)}</div>
                <div className="flex items-center justify-between mt-1">
                  <Badge
                    variant={isPositive ? "default" : "destructive"}
                    className={
                      isPositive
                        ? "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                        : "bg-red-500/20 text-red-700 hover:bg-red-500/30"
                    }
                  >
                    {isPositive ? "+" : ""}
                    {priceChangeNum.toFixed(2)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">Vol: {formatVolume(data.volume)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Updated {Math.floor((Date.now() - data.lastUpdate) / 1000)}s ago
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
