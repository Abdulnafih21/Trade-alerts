export interface MarketData {
  symbol: string
  price: number
  volume: number
  timestamp: number
  high: number
  low: number
  open: number
  close: number
}

export interface OrderBookData {
  symbol: string
  bids: Array<[number, number]> // [price, size]
  asks: Array<[number, number]>
  timestamp: number
}

export interface TechnicalIndicators {
  ema9: number
  ema21: number
  rsi: number
  macd: number
  macdSignal: number
  vwap: number
  atr: number
  bollinger: {
    upper: number
    middle: number
    lower: number
  }
}

export interface Signal {
  id: string
  symbol: string
  side: "LONG" | "SHORT" | "FLAT"
  confidence: number
  price: number
  timestamp: number
  timeHorizon: "scalp" | "intraday" | "swing"
  stopLoss?: number
  takeProfit?: number
  reason: string[]
  indicators: TechnicalIndicators
  strategyId: string
  risk: number
}

export interface Strategy {
  id: string
  name: string
  description: string
  author: string
  type: "momentum" | "mean-reversion" | "breakout" | "news-driven" | "liquidity-sweep"
  timeframes: string[]
  conditions: StrategyCondition[]
  riskManagement: RiskParameters
  performance: StrategyPerformance
}

export interface StrategyCondition {
  indicator: string
  operator: ">" | "<" | "=" | "rising" | "falling" | "crossover"
  value: number | string
  timeframe: string
  weight: number
}

export interface RiskParameters {
  maxRisk: number
  stopLossATR: number
  takeProfitRR: number
  cooldownMinutes: number
}

export interface StrategyPerformance {
  totalSignals: number
  winRate: number
  avgReturn: number
  sharpeRatio: number
  maxDrawdown: number
  profitFactor: number
}

class TechnicalAnalysis {
  static calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0

    const multiplier = 2 / (period + 1)
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema
    }

    return ema
  }

  static calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50

    const changes = prices.slice(1).map((price, i) => price - prices[i])
    const gains = changes.map((change) => (change > 0 ? change : 0))
    const losses = changes.map((change) => (change < 0 ? -change : 0))

    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  static calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macd = ema12 - ema26

    // Simplified signal line calculation
    const signal = macd * 0.8 // Approximation
    const histogram = macd - signal

    return { macd, signal, histogram }
  }

  static calculateVWAP(prices: number[], volumes: number[]): number {
    if (prices.length !== volumes.length || prices.length === 0) return 0

    const totalVolumePrice = prices.reduce((sum, price, i) => sum + price * volumes[i], 0)
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0)

    return totalVolume > 0 ? totalVolumePrice / totalVolume : prices[prices.length - 1]
  }

  static calculateATR(highs: number[], lows: number[], closes: number[], period = 14): number {
    if (highs.length < 2) return 0

    const trueRanges = []
    for (let i = 1; i < highs.length; i++) {
      const tr1 = highs[i] - lows[i]
      const tr2 = Math.abs(highs[i] - closes[i - 1])
      const tr3 = Math.abs(lows[i] - closes[i - 1])
      trueRanges.push(Math.max(tr1, tr2, tr3))
    }

    return trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / Math.min(period, trueRanges.length)
  }

  static calculateBollingerBands(prices: number[], period = 20, stdDev = 2) {
    if (prices.length < period) {
      const price = prices[prices.length - 1] || 0
      return { upper: price, middle: price, lower: price }
    }

    const recentPrices = prices.slice(-period)
    const middle = recentPrices.reduce((sum, price) => sum + price, 0) / period

    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)

    return {
      upper: middle + standardDeviation * stdDev,
      middle,
      lower: middle - standardDeviation * stdDev,
    }
  }
}

export class SignalEngine {
  private strategies: Map<string, Strategy> = new Map()
  private marketData: Map<string, MarketData[]> = new Map()
  private orderBooks: Map<string, OrderBookData> = new Map()
  private activeSignals: Map<string, Signal> = new Map()
  private signalHistory: Signal[] = []

  constructor() {
    this.initializeDefaultStrategies()
  }

  private initializeDefaultStrategies() {
    const momentumStrategy: Strategy = {
      id: "momentum-scalper",
      name: "Momentum Scalper",
      description: "High-frequency momentum strategy with liquidity confirmation",
      author: "TradingPro",
      type: "momentum",
      timeframes: ["1m", "5m"],
      conditions: [
        { indicator: "ema9", operator: ">", value: "ema21", timeframe: "1m", weight: 0.3 },
        { indicator: "rsi", operator: "rising", value: 0, timeframe: "1m", weight: 0.2 },
        { indicator: "price", operator: ">", value: "vwap", timeframe: "5m", weight: 0.2 },
        { indicator: "volume", operator: ">", value: 1.5, timeframe: "1m", weight: 0.3 },
      ],
      riskManagement: {
        maxRisk: 0.02,
        stopLossATR: 1.2,
        takeProfitRR: 1.5,
        cooldownMinutes: 10,
      },
      performance: {
        totalSignals: 1247,
        winRate: 0.68,
        avgReturn: 0.034,
        sharpeRatio: 2.34,
        maxDrawdown: 0.12,
        profitFactor: 1.89,
      },
    }

    const meanReversionStrategy: Strategy = {
      id: "mean-reversion",
      name: "Mean Reversion",
      description: "Counter-trend strategy targeting oversold/overbought conditions",
      author: "QuantMaster",
      type: "mean-reversion",
      timeframes: ["5m", "15m"],
      conditions: [
        { indicator: "rsi", operator: "<", value: 30, timeframe: "5m", weight: 0.4 },
        { indicator: "price", operator: "<", value: "bollinger.lower", timeframe: "5m", weight: 0.3 },
        { indicator: "volume", operator: ">", value: 1.2, timeframe: "5m", weight: 0.3 },
      ],
      riskManagement: {
        maxRisk: 0.015,
        stopLossATR: 1.0,
        takeProfitRR: 2.0,
        cooldownMinutes: 15,
      },
      performance: {
        totalSignals: 892,
        winRate: 0.72,
        avgReturn: 0.028,
        sharpeRatio: 1.89,
        maxDrawdown: 0.08,
        profitFactor: 2.12,
      },
    }

    this.strategies.set(momentumStrategy.id, momentumStrategy)
    this.strategies.set(meanReversionStrategy.id, meanReversionStrategy)
  }

  updateMarketData(symbol: string, data: MarketData) {
    if (!this.marketData.has(symbol)) {
      this.marketData.set(symbol, [])
    }

    const history = this.marketData.get(symbol)!
    history.push(data)

    // Keep last 100 candles for calculations
    if (history.length > 100) {
      history.shift()
    }

    this.evaluateStrategies(symbol)
  }

  updateOrderBook(symbol: string, orderBook: OrderBookData) {
    this.orderBooks.set(symbol, orderBook)
  }

  private calculateIndicators(symbol: string): TechnicalIndicators | null {
    const history = this.marketData.get(symbol)
    if (!history || history.length < 21) return null

    const prices = history.map((d) => d.close)
    const volumes = history.map((d) => d.volume)
    const highs = history.map((d) => d.high)
    const lows = history.map((d) => d.low)

    const ema9 = TechnicalAnalysis.calculateEMA(prices, 9)
    const ema21 = TechnicalAnalysis.calculateEMA(prices, 21)
    const rsi = TechnicalAnalysis.calculateRSI(prices)
    const macdData = TechnicalAnalysis.calculateMACD(prices)
    const vwap = TechnicalAnalysis.calculateVWAP(prices, volumes)
    const atr = TechnicalAnalysis.calculateATR(highs, lows, prices)
    const bollinger = TechnicalAnalysis.calculateBollingerBands(prices)

    return {
      ema9,
      ema21,
      rsi,
      macd: macdData.macd,
      macdSignal: macdData.signal,
      vwap,
      atr,
      bollinger,
    }
  }

  private evaluateStrategies(symbol: string) {
    const indicators = this.calculateIndicators(symbol)
    if (!indicators) return

    const currentData = this.marketData.get(symbol)?.slice(-1)[0]
    if (!currentData) return

    for (const strategy of this.strategies.values()) {
      const signal = this.evaluateStrategy(strategy, symbol, currentData, indicators)
      if (signal && signal.side !== "FLAT") {
        this.activeSignals.set(signal.id, signal)
        this.signalHistory.unshift(signal)

        // Keep history manageable
        if (this.signalHistory.length > 1000) {
          this.signalHistory = this.signalHistory.slice(0, 500)
        }
      }
    }
  }

  private evaluateStrategy(
    strategy: Strategy,
    symbol: string,
    currentData: MarketData,
    indicators: TechnicalIndicators,
  ): Signal | null {
    let totalScore = 0
    let maxScore = 0
    const reasons: string[] = []

    for (const condition of strategy.conditions) {
      maxScore += condition.weight

      let conditionMet = false
      let reason = ""

      switch (condition.indicator) {
        case "ema9":
          if (condition.operator === ">" && condition.value === "ema21") {
            conditionMet = indicators.ema9 > indicators.ema21
            reason = conditionMet ? "EMA9 > EMA21" : ""
          }
          break

        case "rsi":
          if (condition.operator === "<" && typeof condition.value === "number") {
            conditionMet = indicators.rsi < condition.value
            reason = conditionMet ? `RSI < ${condition.value}` : ""
          } else if (condition.operator === ">" && typeof condition.value === "number") {
            conditionMet = indicators.rsi > condition.value
            reason = conditionMet ? `RSI > ${condition.value}` : ""
          }
          break

        case "price":
          if (condition.operator === ">" && condition.value === "vwap") {
            conditionMet = currentData.close > indicators.vwap
            reason = conditionMet ? "Price > VWAP" : ""
          } else if (condition.operator === "<" && condition.value === "bollinger.lower") {
            conditionMet = currentData.close < indicators.bollinger.lower
            reason = conditionMet ? "Price < BB Lower" : ""
          }
          break

        case "volume":
          if (condition.operator === ">" && typeof condition.value === "number") {
            const avgVolume = this.getAverageVolume(symbol, 20)
            conditionMet = currentData.volume > avgVolume * condition.value
            reason = conditionMet ? `Volume > ${condition.value}x avg` : ""
          }
          break
      }

      if (conditionMet) {
        totalScore += condition.weight
        if (reason) reasons.push(reason)
      }
    }

    const confidence = totalScore / maxScore

    // Generate signal if confidence threshold is met
    if (confidence >= 0.6) {
      const side = strategy.type === "mean-reversion" ? "LONG" : indicators.ema9 > indicators.ema21 ? "LONG" : "SHORT"

      const stopLoss =
        currentData.close - indicators.atr * strategy.riskManagement.stopLossATR * (side === "LONG" ? 1 : -1)
      const takeProfit =
        currentData.close +
        Math.abs(currentData.close - stopLoss) * strategy.riskManagement.takeProfitRR * (side === "LONG" ? 1 : -1)

      return {
        id: `${strategy.id}-${symbol}-${Date.now()}`,
        symbol,
        side,
        confidence,
        price: currentData.close,
        timestamp: currentData.timestamp,
        timeHorizon: "intraday",
        stopLoss,
        takeProfit,
        reason: reasons,
        indicators,
        strategyId: strategy.id,
        risk: strategy.riskManagement.maxRisk,
      }
    }

    return null
  }

  private getAverageVolume(symbol: string, periods: number): number {
    const history = this.marketData.get(symbol)
    if (!history || history.length < periods) return 0

    const recentVolumes = history.slice(-periods).map((d) => d.volume)
    return recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length
  }

  getActiveSignals(): Signal[] {
    return Array.from(this.activeSignals.values())
  }

  getSignalHistory(limit = 50): Signal[] {
    return this.signalHistory.slice(0, limit)
  }

  getStrategies(): Strategy[] {
    return Array.from(this.strategies.values())
  }

  getStrategy(id: string): Strategy | undefined {
    return this.strategies.get(id)
  }

  addStrategy(strategy: Strategy) {
    this.strategies.set(strategy.id, strategy)
  }

  removeStrategy(id: string) {
    this.strategies.delete(id)
  }
}

// Singleton instance
export const signalEngine = new SignalEngine()
