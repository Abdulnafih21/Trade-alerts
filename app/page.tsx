"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { NavigationHeader } from "@/components/layout/navigation-header"
import { SidebarNavigation } from "@/components/layout/sidebar-navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RealTimeSignals } from "@/components/trading/real-time-signals"
import { StrategyStudio } from "@/components/trading/strategy-studio"
import { CommunityHub } from "@/components/trading/community-hub"
import { BacktestingDashboard } from "@/components/trading/backtesting-dashboard"
import AlertDashboard from "@/components/trading/alert-dashboard"
import { TestingDashboard } from "@/components/trading/testing-dashboard"
import { PortfolioDashboard } from "@/components/trading/portfolio-dashboard"
import { LiveMarketData } from "@/components/trading/live-market-data"
import { LiveCandlestickChart } from "@/components/trading/live-candlestick-chart"
import { SignalFeed } from "@/components/demo/signal-feed"
import { PnLSummary } from "@/components/demo/pnl-summary"

export default function TradingDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsConnected(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Loading TradingSignals Pro</h2>
            <p className="text-muted-foreground">Connecting to live market data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationHeader isConnected={isConnected} notificationCount={3} />

      <div className="flex">
        <SidebarNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 overflow-hidden">
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6">
              <Tabs value={activeTab} className="w-full">
                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6 mt-0">
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold font-[var(--font-heading)] mb-2">Trading Dashboard</h1>
                      <p className="text-muted-foreground">Real-time market data, signals, and portfolio performance</p>
                    </div>

                    <LiveMarketData />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <LiveCandlestickChart />
                      </div>
                      <div className="space-y-6">
                        <PnLSummary />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <SignalFeed />
                    </div>
                  </div>
                </TabsContent>

                {/* Signals Tab */}
                <TabsContent value="signals" className="mt-0">
                  <RealTimeSignals />
                </TabsContent>

                {/* Strategies Tab */}
                <TabsContent value="strategies" className="mt-0">
                  <StrategyStudio />
                </TabsContent>

                {/* Backtest Tab */}
                <TabsContent value="backtest" className="mt-0">
                  <BacktestingDashboard />
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community" className="mt-0">
                  <CommunityHub />
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="mt-0">
                  <AlertDashboard />
                </TabsContent>

                {/* Testing Tab */}
                <TabsContent value="testing" className="mt-0">
                  <TestingDashboard />
                </TabsContent>

                {/* Portfolio Tab */}
                <TabsContent value="portfolio" className="mt-0">
                  <PortfolioDashboard />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
