"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { signalEngine } from "@/lib/signal-engine"
import { CheckCircle, XCircle, AlertTriangle, Play, BarChart3, TrendingUp } from "lucide-react"

export function TestingDashboard() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [priceValidations, setPriceValidations] = useState<any[]>([])
  const [discrepancyStats, setDiscrepancyStats] = useState<any>({})

  const runTests = async () => {
    setIsRunning(true)

    // Simulate test execution time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const results = signalEngine.runComprehensiveTest()
    setTestResults(results)

    // Get pricing data
    setPriceValidations(signalEngine.getPriceValidations())
    setDiscrepancyStats(signalEngine.getDiscrepancyStats())

    setIsRunning(false)
  }

  useEffect(() => {
    // Load initial data
    setPriceValidations(signalEngine.getPriceValidations())
    setDiscrepancyStats(signalEngine.getDiscrepancyStats())
  }, [])

  const getStatusIcon = (passed: boolean) => {
    return passed ? <CheckCircle className="h-5 w-5 text-chart-4" /> : <XCircle className="h-5 w-5 text-chart-2" />
  }

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"} className={passed ? "bg-chart-4" : "bg-chart-2"}>
        {passed ? "PASSED" : "FAILED"}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-[var(--font-heading)]">Platform Testing Dashboard</h2>
        <Button onClick={runTests} disabled={isRunning} className="bg-primary hover:bg-primary/80">
          <Play className="h-4 w-4 mr-2" />
          {isRunning ? "Running Tests..." : "Run Comprehensive Test"}
        </Button>
      </div>

      {/* Test Results Overview */}
      {testResults && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(testResults.passed)}
                <span>Overall Test Results</span>
              </CardTitle>
              {getStatusBadge(testResults.passed)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(testResults.results).map(([testName, result]: [string, any]) => (
                <div key={testName} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{testName.replace(/([A-Z])/g, " $1").trim()}</h4>
                    {getStatusIcon(result.passed)}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.strategiesLoaded && (
                    <div className="mt-2 text-xs">
                      <span className="font-medium">{result.strategiesLoaded}</span> strategies loaded
                    </div>
                  )}
                  {result.discrepancy !== undefined && (
                    <div className="mt-2 text-xs">
                      Discrepancy: <span className="font-medium">{(result.discrepancy * 100).toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Validation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Price Validation Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Avg Discrepancy</span>
                  <span className="font-medium">{discrepancyStats.avgDiscrepancy?.toFixed(2) || 0}%</span>
                </div>
                <Progress value={Math.min(discrepancyStats.avgDiscrepancy || 0, 10) * 10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Max Discrepancy</span>
                  <span className="font-medium">{discrepancyStats.maxDiscrepancy?.toFixed(2) || 0}%</span>
                </div>
                <Progress value={Math.min(discrepancyStats.maxDiscrepancy || 0, 10) * 10} className="h-2" />
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-sm">Total Validations</span>
                  <span className="font-semibold">{discrepancyStats.totalValidations || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Strategy Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Strategies</span>
                <span className="font-semibold">{signalEngine.getStrategies().length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Signals</span>
                <span className="font-semibold">{signalEngine.getActiveSignals().length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Signal History</span>
                <span className="font-semibold">{signalEngine.getSignalHistory().length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Price Validation</span>
                <Badge variant="outline" className="bg-chart-4/20 text-chart-4 border-chart-4">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Signal Generation</span>
                <Badge variant="outline" className="bg-chart-4/20 text-chart-4 border-chart-4">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Market Data Feed</span>
                <Badge variant="outline" className="bg-chart-4/20 text-chart-4 border-chart-4">
                  Live
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Price Validations */}
      {priceValidations.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Price Validations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {priceValidations.slice(0, 10).map((validation, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{validation.symbol}</span>
                    <span className="text-sm text-muted-foreground">${validation.actualPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-medium ${
                        validation.discrepancy > 0.05 ? "text-chart-2" : "text-chart-4"
                      }`}
                    >
                      {(validation.discrepancy * 100).toFixed(2)}%
                    </span>
                    {validation.discrepancy > 0.05 ? (
                      <AlertTriangle className="h-4 w-4 text-chart-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-chart-4" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isRunning && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div>
                <h3 className="font-semibold">Running Comprehensive Tests</h3>
                <p className="text-sm text-muted-foreground">
                  Testing price validation, strategy execution, and signal generation...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
