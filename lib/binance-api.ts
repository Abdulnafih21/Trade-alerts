// Binance API integration for live market data
export interface CandlestickData {
  symbol: string
  openTime: number
  closeTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  trades: number
}

export interface TickerData {
  symbol: string
  price: string
  priceChange: string
  priceChangePercent: string
  volume: string
}

class BinanceAPI {
  private baseURL = "https://api.binance.com/api/v3"
  private wsURL = "wss://stream.binance.com:9443/ws"
  private wsConnections: Map<string, WebSocket> = new Map()

  // Get current price for a symbol
  async getCurrentPrice(symbol: string): Promise<TickerData | null> {
    try {
      const response = await fetch(`${this.baseURL}/ticker/24hr?symbol=${symbol}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error)
      return null
    }
  }

  // Get historical candlestick data
  async getHistoricalData(symbol: string, interval = "1h", limit = 500): Promise<CandlestickData[]> {
    try {
      const response = await fetch(`${this.baseURL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      return data.map((candle: any[]) => ({
        symbol,
        openTime: candle[0],
        closeTime: candle[6],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
        trades: candle[8],
      }))
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error)
      return []
    }
  }

  // Get multiple symbols data
  async getMultipleSymbolsData(symbols: string[]): Promise<TickerData[]> {
    try {
      const symbolsParam = symbols.map((s) => `"${s}"`).join(",")
      const response = await fetch(`${this.baseURL}/ticker/24hr?symbols=[${symbolsParam}]`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching multiple symbols data:", error)
      return []
    }
  }

  // Subscribe to real-time price updates (client-side only)
  subscribeToPrice(symbol: string, callback: (data: any) => void): () => void {
    if (typeof window === "undefined") return () => {}

    const streamName = `${symbol.toLowerCase()}@ticker`
    const ws = new WebSocket(`${this.wsURL}/${streamName}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback({
        symbol: data.s,
        price: data.c,
        priceChange: data.P,
        volume: data.v,
      })
    }

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${symbol}:`, error)
    }

    this.wsConnections.set(symbol, ws)

    // Return cleanup function
    return () => {
      ws.close()
      this.wsConnections.delete(symbol)
    }
  }

  // Close all WebSocket connections
  closeAllConnections() {
    this.wsConnections.forEach((ws) => ws.close())
    this.wsConnections.clear()
  }
}

export const binanceAPI = new BinanceAPI()

// Popular trading pairs
export const POPULAR_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "XRPUSDT", "DOTUSDT", "DOGEUSDT"]
