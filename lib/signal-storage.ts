import { createServerClient } from "./supabase/server"
import { tradingSignalsEngine, type TradingSignal } from "./trading-signals"
import { POPULAR_SYMBOLS } from "./binance-api"

export interface StoredSignal extends TradingSignal {
  id: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface SignalPerformance {
  signal_id: string
  current_price: number
  pnl_percentage: number
  status: "open" | "closed" | "stopped"
  updated_at: string
}

class SignalStorageService {
  private supabase = createServerClient()

  // Store a new signal in the database
  async storeSignal(signal: TradingSignal, userId?: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("trading_signals")
        .insert({
          symbol: signal.symbol,
          signal_type: signal.signal_type,
          confidence: signal.confidence,
          strategy_name: signal.strategy_name,
          entry_price: signal.entry_price,
          stop_loss: signal.stop_loss,
          take_profit: signal.take_profit,
          reasoning: signal.reasoning,
          user_id: userId,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Error storing signal:", error)
        return null
      }

      return data?.id || null
    } catch (error) {
      console.error("Error storing signal:", error)
      return null
    }
  }

  // Get recent signals from database
  async getRecentSignals(limit = 50, userId?: string): Promise<StoredSignal[]> {
    try {
      let query = this.supabase
        .from("trading_signals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq("user_id", userId)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching signals:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching signals:", error)
      return []
    }
  }

  // Get signals by symbol
  async getSignalsBySymbol(symbol: string, limit = 20): Promise<StoredSignal[]> {
    try {
      const { data, error } = await this.supabase
        .from("trading_signals")
        .select("*")
        .eq("symbol", symbol)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching signals by symbol:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching signals by symbol:", error)
      return []
    }
  }

  // Get signals by strategy
  async getSignalsByStrategy(strategyName: string, limit = 20): Promise<StoredSignal[]> {
    try {
      const { data, error } = await this.supabase
        .from("trading_signals")
        .select("*")
        .eq("strategy_name", strategyName)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching signals by strategy:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching signals by strategy:", error)
      return []
    }
  }

  // Generate and store signals for all popular symbols
  async generateAndStoreSignals(): Promise<number> {
    let signalsGenerated = 0

    try {
      for (const symbol of POPULAR_SYMBOLS) {
        const signal = await tradingSignalsEngine.generateSignal(symbol)

        if (signal && signal.signal_type !== "FLAT") {
          const signalId = await this.storeSignal(signal)
          if (signalId) {
            signalsGenerated++
            console.log(`Generated and stored ${signal.signal_type} signal for ${symbol}`)
          }
        }
      }
    } catch (error) {
      console.error("Error generating and storing signals:", error)
    }

    return signalsGenerated
  }

  // Get signal statistics
  async getSignalStatistics(days = 7): Promise<{
    totalSignals: number
    longSignals: number
    shortSignals: number
    avgConfidence: number
    topSymbols: Array<{ symbol: string; count: number }>
    topStrategies: Array<{ strategy: string; count: number }>
  }> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabase
        .from("trading_signals")
        .select("symbol, signal_type, confidence, strategy_name")
        .gte("created_at", startDate.toISOString())

      if (error) {
        console.error("Error fetching signal statistics:", error)
        return {
          totalSignals: 0,
          longSignals: 0,
          shortSignals: 0,
          avgConfidence: 0,
          topSymbols: [],
          topStrategies: [],
        }
      }

      const signals = data || []
      const totalSignals = signals.length
      const longSignals = signals.filter((s) => s.signal_type === "LONG").length
      const shortSignals = signals.filter((s) => s.signal_type === "SHORT").length
      const avgConfidence = totalSignals > 0 ? signals.reduce((sum, s) => sum + s.confidence, 0) / totalSignals : 0

      // Count symbols
      const symbolCounts: Record<string, number> = {}
      const strategyCounts: Record<string, number> = {}

      signals.forEach((signal) => {
        symbolCounts[signal.symbol] = (symbolCounts[signal.symbol] || 0) + 1
        strategyCounts[signal.strategy_name] = (strategyCounts[signal.strategy_name] || 0) + 1
      })

      const topSymbols = Object.entries(symbolCounts)
        .map(([symbol, count]) => ({ symbol, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const topStrategies = Object.entries(strategyCounts)
        .map(([strategy, count]) => ({ strategy, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return {
        totalSignals,
        longSignals,
        shortSignals,
        avgConfidence,
        topSymbols,
        topStrategies,
      }
    } catch (error) {
      console.error("Error calculating signal statistics:", error)
      return {
        totalSignals: 0,
        longSignals: 0,
        shortSignals: 0,
        avgConfidence: 0,
        topSymbols: [],
        topStrategies: [],
      }
    }
  }

  // Delete old signals (cleanup)
  async cleanupOldSignals(daysToKeep = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const { data, error } = await this.supabase
        .from("trading_signals")
        .delete()
        .lt("created_at", cutoffDate.toISOString())
        .select("id")

      if (error) {
        console.error("Error cleaning up old signals:", error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error("Error cleaning up old signals:", error)
      return 0
    }
  }
}

export const signalStorageService = new SignalStorageService()
