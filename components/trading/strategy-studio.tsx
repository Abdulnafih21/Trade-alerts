"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Trash2, Play, Save, Code, Blocks, TrendingUp, Target, Settings, Copy, Download, Upload } from "lucide-react"

interface StrategyNode {
  id: string
  type: "indicator" | "condition" | "logic" | "risk"
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
  connections: string[]
}

interface StrategyTemplate {
  id: string
  name: string
  description: string
  category: "momentum" | "mean-reversion" | "breakout" | "scalping" | "swing"
  nodes: StrategyNode[]
  riskConfig: RiskConfig
}

interface RiskConfig {
  maxRisk: number
  stopLossATR: number
  takeProfitRR: number
  cooldownMinutes: number
  maxPositions: number
}

const indicatorTemplates = [
  { id: "ema", name: "EMA", params: ["period"] },
  { id: "sma", name: "SMA", params: ["period"] },
  { id: "rsi", name: "RSI", params: ["period", "overbought", "oversold"] },
  { id: "macd", name: "MACD", params: ["fast", "slow", "signal"] },
  { id: "bollinger", name: "Bollinger Bands", params: ["period", "stdDev"] },
  { id: "atr", name: "ATR", params: ["period"] },
  { id: "vwap", name: "VWAP", params: [] },
  { id: "stochastic", name: "Stochastic", params: ["kPeriod", "dPeriod"] },
]

const conditionTemplates = [
  { id: "greater", name: "Greater Than", symbol: ">" },
  { id: "less", name: "Less Than", symbol: "<" },
  { id: "equal", name: "Equal To", symbol: "=" },
  { id: "crossover", name: "Crossover", symbol: "↗" },
  { id: "crossunder", name: "Cross Under", symbol: "↘" },
  { id: "rising", name: "Rising", symbol: "↑" },
  { id: "falling", name: "Falling", symbol: "↓" },
]

const strategyTemplates: StrategyTemplate[] = [
  {
    id: "momentum-scalp",
    name: "Momentum Scalper",
    description: "Fast EMA crossover with volume confirmation",
    category: "momentum",
    nodes: [
      {
        id: "ema9",
        type: "indicator",
        name: "EMA 9",
        config: { indicator: "ema", period: 9 },
        position: { x: 100, y: 100 },
        connections: ["condition1"],
      },
      {
        id: "ema21",
        type: "indicator",
        name: "EMA 21",
        config: { indicator: "ema", period: 21 },
        position: { x: 100, y: 200 },
        connections: ["condition1"],
      },
      {
        id: "condition1",
        type: "condition",
        name: "EMA Crossover",
        config: { type: "crossover", weight: 0.6 },
        position: { x: 300, y: 150 },
        connections: ["logic1"],
      },
      {
        id: "volume",
        type: "indicator",
        name: "Volume",
        config: { indicator: "volume", multiplier: 1.5 },
        position: { x: 100, y: 300 },
        connections: ["condition2"],
      },
      {
        id: "condition2",
        type: "condition",
        name: "Volume Spike",
        config: { type: "greater", threshold: 1.5, weight: 0.4 },
        position: { x: 300, y: 300 },
        connections: ["logic1"],
      },
      {
        id: "logic1",
        type: "logic",
        name: "AND Gate",
        config: { operator: "AND", threshold: 0.7 },
        position: { x: 500, y: 225 },
        connections: [],
      },
    ],
    riskConfig: {
      maxRisk: 0.02,
      stopLossATR: 1.2,
      takeProfitRR: 1.5,
      cooldownMinutes: 10,
      maxPositions: 3,
    },
  },
  {
    id: "mean-reversion",
    name: "Mean Reversion",
    description: "RSI oversold with Bollinger Band support",
    category: "mean-reversion",
    nodes: [
      {
        id: "rsi",
        type: "indicator",
        name: "RSI 14",
        config: { indicator: "rsi", period: 14 },
        position: { x: 100, y: 100 },
        connections: ["condition1"],
      },
      {
        id: "condition1",
        type: "condition",
        name: "RSI Oversold",
        config: { type: "less", threshold: 30, weight: 0.5 },
        position: { x: 300, y: 100 },
        connections: ["logic1"],
      },
      {
        id: "bollinger",
        type: "indicator",
        name: "Bollinger Bands",
        config: { indicator: "bollinger", period: 20, stdDev: 2 },
        position: { x: 100, y: 250 },
        connections: ["condition2"],
      },
      {
        id: "condition2",
        type: "condition",
        name: "Below Lower Band",
        config: { type: "less", field: "lower", weight: 0.5 },
        position: { x: 300, y: 250 },
        connections: ["logic1"],
      },
      {
        id: "logic1",
        type: "logic",
        name: "AND Gate",
        config: { operator: "AND", threshold: 0.8 },
        position: { x: 500, y: 175 },
        connections: [],
      },
    ],
    riskConfig: {
      maxRisk: 0.015,
      stopLossATR: 1.0,
      takeProfitRR: 2.0,
      cooldownMinutes: 15,
      maxPositions: 2,
    },
  },
]

export function StrategyStudio() {
  const [activeTab, setActiveTab] = useState("visual")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [strategyName, setStrategyName] = useState("")
  const [strategyDescription, setStrategyDescription] = useState("")
  const [nodes, setNodes] = useState<StrategyNode[]>([])
  const [riskConfig, setRiskConfig] = useState<RiskConfig>({
    maxRisk: 0.02,
    stopLossATR: 1.2,
    takeProfitRR: 1.5,
    cooldownMinutes: 10,
    maxPositions: 3,
  })
  const [codeContent, setCodeContent] = useState(`// Java Strategy Example
public class CustomStrategy extends Strategy {
  @Override
  public void onBar(Candle c) {
    double ema9 = ema(9).value();
    double ema21 = ema(21).value();
    double rsi = rsi(14).value();
    double volume = c.volume();
    double avgVolume = avgVolume(20);
    
    boolean trendUp = ema9 > ema21;
    boolean volumeSpike = volume > avgVolume * 1.5;
    boolean rsiOk = rsi > 30 && rsi < 70;
    
    if (trendUp && volumeSpike && rsiOk) {
      emitSignal(Side.LONG)
        .confidence(0.75)
        .slAtr(1.2)
        .tpRR(1.5)
        .cooldown(Duration.ofMinutes(10));
    }
  }
}`)

  const loadTemplate = useCallback((templateId: string) => {
    const template = strategyTemplates.find((t) => t.id === templateId)
    if (template) {
      setStrategyName(template.name)
      setStrategyDescription(template.description)
      setNodes(template.nodes)
      setRiskConfig(template.riskConfig)
      setSelectedTemplate(templateId)
    }
  }, [])

  const addNode = useCallback(
    (type: StrategyNode["type"], config: Record<string, any>) => {
      const newNode: StrategyNode = {
        id: `${type}-${Date.now()}`,
        type,
        name: config.name || `${type} ${nodes.length + 1}`,
        config,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        connections: [],
      }
      setNodes((prev) => [...prev, newNode])
    },
    [nodes.length],
  )

  const removeNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== nodeId))
  }, [])

  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, config: { ...node.config, ...config } } : node)),
    )
  }, [])

  const generateStrategyCode = useCallback(() => {
    const indicators = nodes.filter((n) => n.type === "indicator")
    const conditions = nodes.filter((n) => n.type === "condition")
    const logic = nodes.filter((n) => n.type === "logic")

    let code = `// Generated Strategy: ${strategyName}\n`
    code += `// Description: ${strategyDescription}\n\n`
    code += `public class ${strategyName.replace(/\s+/g, "")}Strategy extends Strategy {\n`
    code += `  @Override\n`
    code += `  public void onBar(Candle c) {\n`

    // Generate indicator calculations
    indicators.forEach((indicator) => {
      const { indicator: type, period } = indicator.config
      code += `    double ${indicator.id} = ${type}(${period || ""}).value();\n`
    })

    code += `\n    // Strategy conditions\n`
    conditions.forEach((condition, index) => {
      const { type, threshold, weight } = condition.config
      code += `    boolean condition${index + 1} = /* implement ${type} logic */;\n`
    })

    code += `\n    // Signal generation\n`
    code += `    if (/* combine conditions */) {\n`
    code += `      emitSignal(Side.LONG)\n`
    code += `        .confidence(0.75)\n`
    code += `        .slAtr(${riskConfig.stopLossATR})\n`
    code += `        .tpRR(${riskConfig.takeProfitRR})\n`
    code += `        .cooldown(Duration.ofMinutes(${riskConfig.cooldownMinutes}));\n`
    code += `    }\n`
    code += `  }\n`
    code += `}`

    setCodeContent(code)
    setActiveTab("code")
  }, [nodes, strategyName, strategyDescription, riskConfig])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-[var(--font-heading)]">Strategy Studio</h2>
          <p className="text-muted-foreground">Build and test your own trading strategies</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save Strategy
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="visual">
            <Blocks className="h-4 w-4 mr-2" />
            Visual Builder
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code className="h-4 w-4 mr-2" />
            Code Editor
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Strategy Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategyTemplates.map((template) => (
                  <Card key={template.id} className="bg-muted/50 border-border hover:bg-muted/70 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {template.category.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">{template.nodes.length} components</div>
                        <Button
                          size="sm"
                          onClick={() => loadTemplate(template.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Component Palette */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Indicators</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {indicatorTemplates.map((indicator) => (
                      <Button
                        key={indicator.id}
                        variant="outline"
                        size="sm"
                        className="justify-start bg-transparent"
                        onClick={() =>
                          addNode("indicator", {
                            name: indicator.name,
                            indicator: indicator.id,
                            period: 14,
                          })
                        }
                      >
                        <TrendingUp className="h-3 w-3 mr-2" />
                        {indicator.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Conditions</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {conditionTemplates.map((condition) => (
                      <Button
                        key={condition.id}
                        variant="outline"
                        size="sm"
                        className="justify-start bg-transparent"
                        onClick={() =>
                          addNode("condition", {
                            name: condition.name,
                            type: condition.id,
                            threshold: 0,
                            weight: 0.5,
                          })
                        }
                      >
                        <Target className="h-3 w-3 mr-2" />
                        {condition.symbol} {condition.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Logic</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start bg-transparent"
                      onClick={() =>
                        addNode("logic", {
                          name: "AND Gate",
                          operator: "AND",
                          threshold: 0.7,
                        })
                      }
                    >
                      AND
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start bg-transparent"
                      onClick={() =>
                        addNode("logic", {
                          name: "OR Gate",
                          operator: "OR",
                          threshold: 0.5,
                        })
                      }
                    >
                      OR
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Canvas */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Strategy Canvas</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={generateStrategyCode}>
                      <Code className="h-4 w-4 mr-2" />
                      Generate Code
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Play className="h-4 w-4 mr-2" />
                      Test Strategy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-muted/20 rounded-lg p-4 min-h-[400px] border-2 border-dashed border-border">
                    {nodes.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Drag components here to build your strategy</p>
                          <p className="text-sm">Or select a template to get started</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {nodes.map((node) => (
                          <Card
                            key={node.id}
                            className="bg-background border-border shadow-sm hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {node.type === "indicator" && <TrendingUp className="h-4 w-4 text-chart-1" />}
                                  {node.type === "condition" && <Target className="h-4 w-4 text-chart-2" />}
                                  {node.type === "logic" && <Blocks className="h-4 w-4 text-chart-3" />}
                                  <span className="font-medium">{node.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {node.type}
                                  </Badge>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeNode(node.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                {Object.entries(node.config)
                                  .slice(0, 3)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(" • ")}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="strategy-name">Strategy Name</Label>
                  <Input
                    id="strategy-name"
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                    placeholder="My Strategy"
                  />
                </div>
                <div>
                  <Label htmlFor="strategy-description">Description</Label>
                  <Textarea
                    id="strategy-description"
                    value={strategyDescription}
                    onChange={(e) => setStrategyDescription(e.target.value)}
                    placeholder="Strategy description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Timeframes</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                      <Badge
                        key={tf}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      >
                        {tf}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Code Editor</CardTitle>
              <div className="flex items-center space-x-2">
                <Select defaultValue="java">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Play className="h-4 w-4 mr-2" />
                  Compile & Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="font-mono text-sm min-h-[400px] bg-muted/20"
                placeholder="Write your strategy code here..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Max Risk per Trade (%)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[riskConfig.maxRisk * 100]}
                    onValueChange={([value]) => setRiskConfig((prev) => ({ ...prev, maxRisk: value / 100 }))}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{(riskConfig.maxRisk * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <Label>Stop Loss (ATR Multiplier)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[riskConfig.stopLossATR]}
                    onValueChange={([value]) => setRiskConfig((prev) => ({ ...prev, stopLossATR: value }))}
                    max={5}
                    min={0.5}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{riskConfig.stopLossATR.toFixed(1)}x</span>
                </div>
              </div>

              <div>
                <Label>Take Profit (Risk:Reward)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[riskConfig.takeProfitRR]}
                    onValueChange={([value]) => setRiskConfig((prev) => ({ ...prev, takeProfitRR: value }))}
                    max={5}
                    min={0.5}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{riskConfig.takeProfitRR.toFixed(1)}:1</span>
                </div>
              </div>

              <div>
                <Label>Cooldown Period (Minutes)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[riskConfig.cooldownMinutes]}
                    onValueChange={([value]) => setRiskConfig((prev) => ({ ...prev, cooldownMinutes: value }))}
                    max={60}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{riskConfig.cooldownMinutes}m</span>
                </div>
              </div>

              <div>
                <Label>Max Concurrent Positions</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[riskConfig.maxPositions]}
                    onValueChange={([value]) => setRiskConfig((prev) => ({ ...prev, maxPositions: value }))}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{riskConfig.maxPositions}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Execution Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Paper Trading</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Real-time Alerts</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto-execute Signals</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>News Filter</Label>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
