export interface AlertCondition {
  id: string
  type: "price" | "signal" | "indicator" | "volume" | "news"
  symbol: string
  operator: "above" | "below" | "crosses_above" | "crosses_below" | "equals"
  value: number
  indicator?: string
  timeframe?: string
}

export interface AlertRule {
  id: string
  name: string
  conditions: AlertCondition[]
  logic: "AND" | "OR"
  channels: ("email" | "push" | "webhook" | "telegram")[]
  throttle: number // minutes
  cooldown: number // minutes
  active: boolean
  created: Date
  lastTriggered?: Date
  triggerCount: number
}

export interface AlertHistory {
  id: string
  ruleId: string
  ruleName: string
  symbol: string
  message: string
  channels: string[]
  timestamp: Date
  delivered: boolean
  deliveryTime?: number // ms
}

class AlertEngine {
  private rules: AlertRule[] = []
  private history: AlertHistory[] = []
  private marketData: any = {}

  constructor() {
    // Initialize with sample rules
    this.rules = [
      {
        id: "alert_1",
        name: "BTC Price Alert",
        conditions: [
          {
            id: "cond_1",
            type: "price",
            symbol: "BTCUSDT",
            operator: "above",
            value: 100000,
          },
        ],
        logic: "AND",
        channels: ["email", "push"],
        throttle: 15,
        cooldown: 60,
        active: true,
        created: new Date("2025-01-15"),
        triggerCount: 3,
      },
      {
        id: "alert_2",
        name: "ETH RSI Oversold",
        conditions: [
          {
            id: "cond_2",
            type: "indicator",
            symbol: "ETHUSDT",
            operator: "below",
            value: 30,
            indicator: "RSI",
            timeframe: "1h",
          },
        ],
        logic: "AND",
        channels: ["telegram", "webhook"],
        throttle: 30,
        cooldown: 120,
        active: true,
        created: new Date("2025-01-10"),
        triggerCount: 7,
      },
    ]

    this.history = [
      {
        id: "hist_1",
        ruleId: "alert_1",
        ruleName: "BTC Price Alert",
        symbol: "BTCUSDT",
        message: "BTC price crossed above $100,000",
        channels: ["email", "push"],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        delivered: true,
        deliveryTime: 1250,
      },
      {
        id: "hist_2",
        ruleId: "alert_2",
        ruleName: "ETH RSI Oversold",
        symbol: "ETHUSDT",
        message: "ETH RSI dropped below 30 (oversold)",
        channels: ["telegram"],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        delivered: true,
        deliveryTime: 890,
      },
    ]
  }

  getRules(): AlertRule[] {
    return this.rules
  }

  getHistory(): AlertHistory[] {
    return this.history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  createRule(rule: Omit<AlertRule, "id" | "created" | "triggerCount">): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: `alert_${Date.now()}`,
      created: new Date(),
      triggerCount: 0,
    }
    this.rules.push(newRule)
    return newRule
  }

  updateRule(id: string, updates: Partial<AlertRule>): AlertRule | null {
    const index = this.rules.findIndex((r) => r.id === id)
    if (index === -1) return null

    this.rules[index] = { ...this.rules[index], ...updates }
    return this.rules[index]
  }

  deleteRule(id: string): boolean {
    const index = this.rules.findIndex((r) => r.id === id)
    if (index === -1) return false

    this.rules.splice(index, 1)
    return true
  }

  // Simulate alert evaluation
  evaluateAlerts(marketData: any): AlertHistory[] {
    const triggeredAlerts: AlertHistory[] = []

    for (const rule of this.rules) {
      if (!rule.active) continue

      // Check cooldown
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime()
        if (timeSinceLastTrigger < rule.cooldown * 60 * 1000) continue
      }

      // Evaluate conditions (simplified)
      const conditionsMet = rule.conditions.every((condition) => {
        const symbolData = marketData[condition.symbol]
        if (!symbolData) return false

        switch (condition.type) {
          case "price":
            return this.evaluatePriceCondition(condition, symbolData.price)
          case "indicator":
            return this.evaluateIndicatorCondition(condition, symbolData.indicators)
          default:
            return false
        }
      })

      if (conditionsMet) {
        const alert: AlertHistory = {
          id: `hist_${Date.now()}_${Math.random()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          symbol: rule.conditions[0].symbol,
          message: this.generateAlertMessage(rule),
          channels: rule.channels,
          timestamp: new Date(),
          delivered: true,
          deliveryTime: Math.random() * 2000 + 500,
        }

        triggeredAlerts.push(alert)
        this.history.unshift(alert)

        // Update rule
        rule.lastTriggered = new Date()
        rule.triggerCount++
      }
    }

    return triggeredAlerts
  }

  private evaluatePriceCondition(condition: AlertCondition, price: number): boolean {
    switch (condition.operator) {
      case "above":
        return price > condition.value
      case "below":
        return price < condition.value
      default:
        return false
    }
  }

  private evaluateIndicatorCondition(condition: AlertCondition, indicators: any): boolean {
    const value = indicators[condition.indicator || ""]
    if (value === undefined) return false

    switch (condition.operator) {
      case "above":
        return value > condition.value
      case "below":
        return value < condition.value
      default:
        return false
    }
  }

  private generateAlertMessage(rule: AlertRule): string {
    const condition = rule.conditions[0]
    const symbol = condition.symbol

    switch (condition.type) {
      case "price":
        return `${symbol} price ${condition.operator.replace("_", " ")} $${condition.value.toLocaleString()}`
      case "indicator":
        return `${symbol} ${condition.indicator} ${condition.operator.replace("_", " ")} ${condition.value}`
      default:
        return `Alert triggered for ${symbol}`
    }
  }

  getAlertStats() {
    const totalRules = this.rules.length
    const activeRules = this.rules.filter((r) => r.active).length
    const totalTriggers = this.rules.reduce((sum, r) => sum + r.triggerCount, 0)
    const avgDeliveryTime = this.history.reduce((sum, h) => sum + (h.deliveryTime || 0), 0) / this.history.length

    return {
      totalRules,
      activeRules,
      totalTriggers,
      avgDeliveryTime: Math.round(avgDeliveryTime),
      deliveryRate: (this.history.filter((h) => h.delivered).length / this.history.length) * 100,
    }
  }
}

export const alertEngine = new AlertEngine()
