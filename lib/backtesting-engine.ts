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

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Generate mock historical data for backtesting
    const symbols = ["BTCUSDT", "ETHUSDT", "SPY", "EURUSD"]
    const startDate = new Date("2023-01-01")
    const endDate = new Date("2024-08-17")

    symbols.forEach((symbol) => {
      const data = []
      let currentPrice = symbol === "BTCUSDT" ? 30000 : symbol === "ETHUSDT" ? 2000 : symbol === "SPY" ? 400 : 1.08

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const change = (Math.random() - 0.5) * 0.04 // ±2% daily change
        currentPrice *= 1 + change

        data.push({
          timestamp: date.getTime(),
          open: currentPrice * (1 + (Math.random() - 0.5) * 0.01),
          high: currentPrice * (1 + Math.random() * 0.02),
          low: currentPrice * (1 - Math.random() * 0.02),
          close: currentPrice,
          volume: Math.random() * 1000000,
        })
      }

      this.historicalData.set(symbol, data)
    })
  }

  async runBacktest(config: BacktestConfig): Promise<BacktestResults> {
    const startTime = Date.now()

    // Get historical data
    const data = this.historicalData.get(config.symbol) || []
    const filteredData = data.filter(
      (d) => d.timestamp >= new Date(config.startDate).getTime() && d.timestamp <= new Date(config.endDate).getTime(),
    )

    // Simulate strategy execution
    const trades = this.simulateStrategy(filteredData, config)

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

    this.results.set(results.id, results)
    return results
  }

  private simulateStrategy(data: any[], config: BacktestConfig): Trade[] {
    const trades: Trade[] = []
    let position: Trade | null = null
    let capital = config.initialCapital

    for (let i = 20; i < data.length; i++) {
      // Start after 20 bars for indicators
      const current = data[i]
      const previous = data.slice(i - 20, i)

      // Simple momentum strategy simulation
      const ema9 = this.calculateEMA(
        previous.map((d) => d.close),
        9,
      )
      const ema21 = this.calculateEMA(
        previous.map((d) => d.close),
        21,
      )
      const rsi = this.calculateRSI(
        previous.map((d) => d.close),
        14,
      )

      // Entry conditions
      if (!position && ema9 > ema21 && rsi > 30 && rsi < 70) {
        const quantity = (capital * config.riskPerTrade) / current.close
        const commission = quantity * current.close * config.commission
        const slippage = quantity * current.close * config.slippage

        position = {
          id: `trade-${trades.length + 1}`,
          symbol: config.symbol,
          side: "LONG",
          entryTime: current.timestamp,
          entryPrice: current.close * (1 + config.slippage), // Account for slippage
          quantity,
          commission,
          slippage,
          reason: "EMA crossover + RSI confirmation",
        }
      }

      // Exit conditions
      if (position && (ema9 < ema21 || rsi > 80 || rsi < 20)) {
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
