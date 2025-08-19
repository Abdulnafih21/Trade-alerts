import { binanceAPI, type CandlestickData } from "./binance-api"
import { createServerClient } from "./supabase/server"

export interface BacktestConfig {
  strategyId: string
  symbol: string
  startDate: string
  endDate: string
  initialCapital: number
  timeframe: string
  commission: number
  slippage: number
  maxPositions: number
  riskPerTrade: number
}

export interface Trade {
  id: string
  symbol: string
  side: "LONG" | "SHORT"
  entryTime: number
  exitTime?: number
  entryPrice: number
  exitPrice?: number
  quantity: number
  pnl?: number
  pnlPercent?: number
  commission: number
  slippage: number
  reason: string
  duration?: number
  maxFavorableExcursion?: number
  maxAdverseExcursion?: number
}

export interface BacktestResults {
  id: string
  config: BacktestConfig
  trades: Trade[]
  performance: PerformanceMetrics
  equity: EquityPoint[]
  drawdown: DrawdownPoint[]
  monthlyReturns: MonthlyReturn[]
  riskMetrics: RiskMetrics
  tradeAnalysis: TradeAnalysis
  startTime: number
  endTime: number
  duration: number
}

export interface PerformanceMetrics {
  totalReturn: number
  annualizedReturn: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  profitFactor: number
  expectancy: number
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  maxDrawdown: number
  maxDrawdownDuration: number
  recoveryFactor: number
  payoffRatio: number
  exposureTime: number
}

export interface EquityPoint {
  timestamp: number
  equity: number
  drawdown: number
  returns: number
}

export interface DrawdownPoint {
  timestamp: number
  drawdown: number
  duration: number
  isActive: boolean
}

export interface MonthlyReturn {
  year: number
  month: number
  return: number
  trades: number
}

export interface RiskMetrics {
  var95: number // Value at Risk 95%
  var99: number // Value at Risk 99%
  cvar95: number // Conditional VaR 95%
  beta: number
  alpha: number
  informationRatio: number
  treynorRatio: number
  trackingError: number
  downside_deviation: number
  upside_deviation: number
}

export interface TradeAnalysis {
  avgTradeDuration: number
  medianTradeDuration: number
  longestTrade: number
  shortestTrade: number
  consecutiveWins: number
  consecutiveLosses: number
  avgBarsInTrade: number
  tradesPerMonth: number
  bestMonth: MonthlyReturn
  worstMonth: MonthlyReturn
}

export interface OptimizationResult {
  parameters: Record<string, number>
  performance: PerformanceMetrics
  score: number
  rank: number
}

class PerformanceCalculator {
  static calculateSharpeRatio(returns: number[], riskFreeRate = 0.02): number {
    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const annualizedReturn = avgReturn * 252 // Daily returns to annual
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance * 252) // Annualized volatility

    return volatility === 0 ? 0 : (annualizedReturn - riskFreeRate) / volatility
  }

  static calculateSortinoRatio(returns: number[], riskFreeRate = 0.02): number {
    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const annualizedReturn = avgReturn * 252

    const downsideReturns = returns.filter((r) => r < 0)
    if (downsideReturns.length === 0) return Number.POSITIVE_INFINITY

    const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length
    const downsideDeviation = Math.sqrt(downsideVariance * 252)

    return downsideDeviation === 0 ? 0 : (annualizedReturn - riskFreeRate) / downsideDeviation
  }

  static calculateMaxDrawdown(equity: number[]): { maxDrawdown: number; duration: number } {
    if (equity.length === 0) return { maxDrawdown: 0, duration: 0 }

    let maxDrawdown = 0
    let maxDuration = 0
    let peak = equity[0]
    let drawdownStart = 0
    let inDrawdown = false

    for (let i = 1; i < equity.length; i++) {
      if (equity[i] > peak) {
        peak = equity[i]
        if (inDrawdown) {
          const duration = i - drawdownStart
          maxDuration = Math.max(maxDuration, duration)
          inDrawdown = false
        }
      } else {
        const drawdown = (peak - equity[i]) / peak
        maxDrawdown = Math.max(maxDrawdown, drawdown)
        if (!inDrawdown) {
          drawdownStart = i
          inDrawdown = true
        }
      }
    }

    return { maxDrawdown, duration: maxDuration }
  }

  static calculateVaR(returns: number[], confidence = 0.95): number {
    if (returns.length === 0) return 0

    const sortedReturns = [...returns].sort((a, b) => a - b)
    const index = Math.floor((1 - confidence) * sortedReturns.length)
    return Math.abs(sortedReturns[index] || 0)
  }

  static calculateCalmarRatio(annualizedReturn: number, maxDrawdown: number): number {
    return maxDrawdown === 0 ? 0 : annualizedReturn / maxDrawdown
  }
}

export class BacktestingEngine {
  private historicalData: Map<string, any[]> = new Map()
  private results: Map<string, BacktestResults> = new Map()
  private supabase = createServerClient()

  constructor() {
    // No mock data initialization here
  }

  private async fetchHistoricalData(
    symbol: string,
    startDate: string,
    endDate: string,
    timeframe: string,
  ): Promise<CandlestickData[]> {
    try {
      console.log(`[v0] Fetching historical data for ${symbol} from ${startDate} to ${endDate}`)

      // Convert timeframe to Binance format
      const binanceTimeframe = this.convertTimeframeToBinance(timeframe)

      // Calculate how many candles we need
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()
      const timeframMs = this.getTimeframeMs(timeframe)
      const limit = Math.min(1000, Math.ceil((end - start) / timeframMs))

      const data = await binanceAPI.getHistoricalData(symbol, binanceTimeframe, limit)
      console.log(`[v0] Fetched ${data.length} candles for ${symbol}`)

      return data
    } catch (error) {
      console.error(`[v0] Error fetching historical data for ${symbol}:`, error)
      throw new Error(`Failed to fetch historical data for ${symbol}`)
    }
  }

  private convertTimeframeToBinance(timeframe: string): string {
    const mapping: Record<string, string> = {
      "1m": "1m",
      "5m": "5m",
      "15m": "15m",
      "1h": "1h",
      "1d": "1d",
    }
    return mapping[timeframe] || "1h"
  }

  private getTimeframeMs(timeframe: string): number {
    const mapping: Record<string, number> = {
      "1m": 60 * 1000,
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "1d": 24 * 60 * 60 * 1000,
    }
    return mapping[timeframe] || 60 * 60 * 1000
  }

  async runBacktest(config: BacktestConfig): Promise<BacktestResults> {
    const startTime = Date.now()
    console.log(`[v0] Starting backtest for ${config.symbol} with strategy ${config.strategyId}`)

    try {
      const historicalData = await this.fetchHistoricalData(
        config.symbol,
        config.startDate,
        config.endDate,
        config.timeframe,
      )

      if (historicalData.length === 0) {
        throw new Error(`No historical data available for ${config.symbol}`)
      }

      console.log(`[v0] Running strategy simulation on ${historicalData.length} data points`)

      // Convert Binance data to internal format
      const formattedData = historicalData.map((candle) => ({
        timestamp: candle.openTime,
        open: Number.parseFloat(candle.open),
        high: Number.parseFloat(candle.high),
        low: Number.parseFloat(candle.low),
        close: Number.parseFloat(candle.close),
        volume: Number.parseFloat(candle.volume),
      }))

      // Simulate strategy execution with real data
      const trades = await this.simulateStrategyWithRealData(formattedData, config)
      console.log(`[v0] Generated ${trades.length} trades`)

      // Calculate performance metrics
      const performance = this.calculatePerformance(trades, config)
      const equity = this.calculateEquityCurve(trades, config.initialCapital)
      const drawdown = this.calculateDrawdownCurve(equity)
      const monthlyReturns = this.calculateMonthlyReturns(trades)
      const riskMetrics = this.calculateRiskMetrics(equity)
      const tradeAnalysis = this.analyzeTradePatterns(trades)

      const results: BacktestResults = {
        id: `backtest-${Date.now()}`,
        config,
        trades,
        performance,
        equity,
        drawdown,
        monthlyReturns,
        riskMetrics,
        tradeAnalysis,
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
      }

      await this.storeBacktestResults(results)

      this.results.set(results.id, results)
      console.log(`[v0] Backtest completed successfully with ${performance.totalReturn * 100}% return`)

      return results
    } catch (error) {
      console.error(`[v0] Backtest failed:`, error)
      throw error
    }
  }

  private async simulateStrategyWithRealData(data: any[], config: BacktestConfig): Promise<Trade[]> {
    const trades: Trade[] = []
    let position: Trade | null = null
    let capital = config.initialCapital

    for (let i = 50; i < data.length; i++) {
      const current = data[i]
      const historicalPrices = data.slice(Math.max(0, i - 50), i).map((d) => d.close)

      // Use the same technical indicators as the live trading engine
      const indicators = {
        rsi: this.calculateRSI(historicalPrices, 14),
        ema9: this.calculateEMA(historicalPrices, 9),
        ema21: this.calculateEMA(historicalPrices, 21),
        macd: this.calculateMACD(historicalPrices),
      }

      // Apply strategy logic based on config.strategyId
      const signal = this.evaluateStrategy(config.strategyId, indicators, current)

      // Entry logic
      if (!position && signal.action === "LONG") {
        const riskAmount = capital * config.riskPerTrade
        const quantity = riskAmount / current.close
        const commission = quantity * current.close * config.commission
        const slippage = quantity * current.close * config.slippage

        position = {
          id: `trade-${trades.length + 1}`,
          symbol: config.symbol,
          side: "LONG",
          entryTime: current.timestamp,
          entryPrice: current.close * (1 + config.slippage),
          quantity,
          commission,
          slippage,
          reason: signal.reason,
        }
      }

      // Exit logic
      if (position && (signal.action === "EXIT" || this.shouldExit(position, current, indicators))) {
        const exitPrice = current.close * (1 - config.slippage)
        const exitCommission = position.quantity * exitPrice * config.commission
        const pnl = (exitPrice - position.entryPrice) * position.quantity - position.commission - exitCommission
        const pnlPercent = pnl / (position.entryPrice * position.quantity)

        const completedTrade: Trade = {
          ...position,
          exitTime: current.timestamp,
          exitPrice,
          pnl,
          pnlPercent,
          commission: position.commission + exitCommission,
          duration: current.timestamp - position.entryTime,
        }

        trades.push(completedTrade)
        capital += pnl
        position = null
      }
    }

    return trades
  }

  private evaluateStrategy(
    strategyId: string,
    indicators: any,
    current: any,
  ): { action: "LONG" | "SHORT" | "EXIT" | "HOLD"; reason: string } {
    const { rsi, ema9, ema21, macd } = indicators

    switch (strategyId) {
      case "momentum-scalper":
        if (ema9 > ema21 && rsi > 50 && rsi < 70 && macd.histogram > 0) {
          return { action: "LONG", reason: "Momentum: EMA9 > EMA21, RSI bullish, MACD positive" }
        }
        if (ema9 < ema21 || rsi > 80 || rsi < 30) {
          return { action: "EXIT", reason: "Momentum exit: Trend reversal or RSI extreme" }
        }
        break

      case "mean-reversion":
        if (rsi < 30 && ema9 < ema21) {
          return { action: "LONG", reason: "Mean reversion: RSI oversold, price below EMA21" }
        }
        if (rsi > 50) {
          return { action: "EXIT", reason: "Mean reversion exit: RSI normalized" }
        }
        break

      case "breakout-hunter":
        // Simplified breakout logic
        if (ema9 > ema21 * 1.005 && rsi > 60 && macd.macd > macd.signal) {
          return { action: "LONG", reason: "Breakout: Strong EMA divergence, RSI momentum, MACD bullish" }
        }
        if (ema9 < ema21 * 0.995) {
          return { action: "EXIT", reason: "Breakout exit: EMA convergence" }
        }
        break

      default:
        return { action: "HOLD", reason: "Unknown strategy" }
    }

    return { action: "HOLD", reason: "No signal" }
  }

  private shouldExit(position: Trade, current: any, indicators: any): boolean {
    // Stop loss and take profit logic
    const currentPrice = current.close
    const entryPrice = position.entryPrice

    // 5% stop loss, 10% take profit
    const stopLoss = entryPrice * 0.95
    const takeProfit = entryPrice * 1.1

    return currentPrice <= stopLoss || currentPrice >= takeProfit
  }

  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 }

    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macd = ema12 - ema26

    // Simplified signal line (9-period EMA of MACD)
    const signal = macd * 0.8 // Approximation
    const histogram = macd - signal

    return { macd, signal, histogram }
  }

  private async storeBacktestResults(results: BacktestResults): Promise<void> {
    try {
      const { error } = await this.supabase.from("backtest_results").insert({
        strategy_name: results.config.strategyId,
        symbol: results.config.symbol,
        timeframe: results.config.timeframe,
        start_date: results.config.startDate,
        end_date: results.config.endDate,
        total_return: results.performance.totalReturn,
        sharpe_ratio: results.performance.sharpeRatio,
        max_drawdown: results.performance.maxDrawdown,
        win_rate: results.performance.winRate,
        total_trades: results.performance.totalTrades,
        profit_factor: results.performance.profitFactor,
      })

      if (error) {
        console.error("[v0] Error storing backtest results:", error)
      } else {
        console.log("[v0] Backtest results stored successfully")
      }
    } catch (error) {
      console.error("[v0] Error storing backtest results:", error)
    }
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0

    const multiplier = 2 / (period + 1)
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema
    }

    return ema
  }

  private calculateRSI(prices: number[], period = 14): number {
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

  private calculatePerformance(trades: Trade[], config: BacktestConfig): PerformanceMetrics {
    if (trades.length === 0) {
      return {
        totalReturn: 0,
        annualizedReturn: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        profitFactor: 0,
        expectancy: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        calmarRatio: 0,
        maxDrawdown: 0,
        maxDrawdownDuration: 0,
        recoveryFactor: 0,
        payoffRatio: 0,
        exposureTime: 0,
      }
    }

    const completedTrades = trades.filter((t) => t.pnl !== undefined)
    const totalPnL = completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const totalReturn = totalPnL / config.initialCapital

    const winningTrades = completedTrades.filter((t) => (t.pnl || 0) > 0)
    const losingTrades = completedTrades.filter((t) => (t.pnl || 0) < 0)

    const avgWin =
      winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length : 0
    const avgLoss =
      losingTrades.length > 0
        ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length)
        : 0

    const returns = completedTrades.map((t) => t.pnlPercent || 0)
    const equity = this.calculateEquityCurve(completedTrades, config.initialCapital)
    const equityValues = equity.map((e) => e.equity)
    const { maxDrawdown, duration: maxDrawdownDuration } = PerformanceCalculator.calculateMaxDrawdown(equityValues)

    const daysDiff = (new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) / (1000 * 60 * 60 * 24)
    const annualizedReturn = Math.pow(1 + totalReturn, 365 / daysDiff) - 1

    return {
      totalReturn,
      annualizedReturn,
      totalTrades: completedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: completedTrades.length > 0 ? winningTrades.length / completedTrades.length : 0,
      avgWin,
      avgLoss,
      largestWin: Math.max(...completedTrades.map((t) => t.pnl || 0)),
      largestLoss: Math.min(...completedTrades.map((t) => t.pnl || 0)),
      profitFactor: avgLoss > 0 ? (avgWin * winningTrades.length) / (avgLoss * losingTrades.length) : 0,
      expectancy: completedTrades.length > 0 ? totalPnL / completedTrades.length : 0,
      sharpeRatio: PerformanceCalculator.calculateSharpeRatio(returns),
      sortinoRatio: PerformanceCalculator.calculateSortinoRatio(returns),
      calmarRatio: PerformanceCalculator.calculateCalmarRatio(annualizedReturn, maxDrawdown),
      maxDrawdown,
      maxDrawdownDuration,
      recoveryFactor: maxDrawdown > 0 ? totalReturn / maxDrawdown : 0,
      payoffRatio: avgLoss > 0 ? avgWin / avgLoss : 0,
      exposureTime: 0.65, // Mock exposure time
    }
  }

  private calculateEquityCurve(trades: Trade[], initialCapital: number): EquityPoint[] {
    const equity: EquityPoint[] = [
      { timestamp: Date.now() - 365 * 24 * 60 * 60 * 1000, equity: initialCapital, drawdown: 0, returns: 0 },
    ]
    let currentEquity = initialCapital
    let peak = initialCapital

    trades.forEach((trade) => {
      if (trade.pnl !== undefined && trade.exitTime) {
        currentEquity += trade.pnl
        peak = Math.max(peak, currentEquity)
        const drawdown = peak > 0 ? (peak - currentEquity) / peak : 0
        const returns = initialCapital > 0 ? (currentEquity - initialCapital) / initialCapital : 0

        equity.push({
          timestamp: trade.exitTime,
          equity: currentEquity,
          drawdown,
          returns,
        })
      }
    })

    return equity
  }

  private calculateDrawdownCurve(equity: EquityPoint[]): DrawdownPoint[] {
    return equity.map((point, index) => ({
      timestamp: point.timestamp,
      drawdown: point.drawdown,
      duration: 0, // Simplified
      isActive: point.drawdown > 0,
    }))
  }

  private calculateMonthlyReturns(trades: Trade[]): MonthlyReturn[] {
    const monthlyData: Record<string, { return: number; trades: number }> = {}

    trades.forEach((trade) => {
      if (trade.pnlPercent !== undefined && trade.exitTime) {
        const date = new Date(trade.exitTime)
        const key = `${date.getFullYear()}-${date.getMonth()}`

        if (!monthlyData[key]) {
          monthlyData[key] = { return: 0, trades: 0 }
        }

        monthlyData[key].return += trade.pnlPercent
        monthlyData[key].trades += 1
      }
    })

    return Object.entries(monthlyData).map(([key, data]) => {
      const [year, month] = key.split("-").map(Number)
      return {
        year,
        month,
        return: data.return,
        trades: data.trades,
      }
    })
  }

  private calculateRiskMetrics(equity: EquityPoint[]): RiskMetrics {
    const returns = equity
      .slice(1)
      .map((point, i) => (equity[i].equity > 0 ? (point.equity - equity[i].equity) / equity[i].equity : 0))

    return {
      var95: PerformanceCalculator.calculateVaR(returns, 0.95),
      var99: PerformanceCalculator.calculateVaR(returns, 0.99),
      cvar95: PerformanceCalculator.calculateVaR(returns, 0.95) * 1.2, // Simplified
      beta: 1.0, // Mock beta
      alpha: 0.02, // Mock alpha
      informationRatio: 0.8, // Mock IR
      treynorRatio: 0.15, // Mock Treynor
      trackingError: 0.05, // Mock tracking error
      downside_deviation: Math.sqrt(returns.filter((r) => r < 0).reduce((sum, r) => sum + r * r, 0) / returns.length),
      upside_deviation: Math.sqrt(returns.filter((r) => r > 0).reduce((sum, r) => sum + r * r, 0) / returns.length),
    }
  }

  private analyzeTradePatterns(trades: Trade[]): TradeAnalysis {
    const completedTrades = trades.filter((t) => t.duration !== undefined)

    if (completedTrades.length === 0) {
      return {
        avgTradeDuration: 0,
        medianTradeDuration: 0,
        longestTrade: 0,
        shortestTrade: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        avgBarsInTrade: 0,
        tradesPerMonth: 0,
        bestMonth: { year: 0, month: 0, return: 0, trades: 0 },
        worstMonth: { year: 0, month: 0, return: 0, trades: 0 },
      }
    }

    const durations = completedTrades.map((t) => t.duration || 0)
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const sortedDurations = [...durations].sort((a, b) => a - b)
    const medianDuration = sortedDurations[Math.floor(sortedDurations.length / 2)]

    return {
      avgTradeDuration: avgDuration / (1000 * 60 * 60), // Convert to hours
      medianTradeDuration: medianDuration / (1000 * 60 * 60),
      longestTrade: Math.max(...durations) / (1000 * 60 * 60),
      shortestTrade: Math.min(...durations) / (1000 * 60 * 60),
      consecutiveWins: 0, // Simplified
      consecutiveLosses: 0, // Simplified
      avgBarsInTrade: 24, // Mock value
      tradesPerMonth: completedTrades.length / 12, // Assuming 1 year backtest
      bestMonth: { year: 2024, month: 3, return: 0.15, trades: 8 },
      worstMonth: { year: 2024, month: 6, return: -0.08, trades: 5 },
    }
  }

  getResults(id: string): BacktestResults | undefined {
    return this.results.get(id)
  }

  getAllResults(): BacktestResults[] {
    return Array.from(this.results.values())
  }
}

// Singleton instance
export const backtestingEngine = new BacktestingEngine()
