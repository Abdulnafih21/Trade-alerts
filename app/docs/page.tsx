"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/docs/code-block"
import { ApiEndpoint } from "@/components/docs/api-endpoint"
import { Book, Code, Zap, Shield, Globe, Database, Signal, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

const quickStartCode = `// Install the SDK
npm install @tradingsignals/sdk

// Initialize the client
import { TradingSignalsClient } from '@tradingsignals/sdk';

const client = new TradingSignalsClient({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Subscribe to real-time signals
client.signals.subscribe({
  symbols: ['BTCUSDT', 'ETHUSDT'],
  strategies: ['momentum', 'mean-reversion'],
  onSignal: (signal) => {
    console.log('New signal:', signal);
    // Execute your trading logic
  }
});`

const pythonExample = `# Python SDK Example
from tradingsignals import TradingSignalsClient
import asyncio

async def main():
    client = TradingSignalsClient(api_key="your-api-key")
    
    # Get latest signals
    signals = await client.signals.get_latest(
        symbols=["BTCUSDT", "ETHUSDT"],
        limit=10
    )
    
    for signal in signals:
        print(f"Signal: {signal.side} {signal.symbol} at {signal.price}")
        print(f"Confidence: {signal.confidence:.2%}")
        print(f"Reason: {signal.reason}")
        print("---")

asyncio.run(main())`

const javaExample = `// Java SDK Example
import com.tradingsignals.TradingSignalsClient;
import com.tradingsignals.models.Signal;
import java.util.List;

public class TradingBot {
    public static void main(String[] args) {
        TradingSignalsClient client = new TradingSignalsClient.Builder()
            .apiKey("your-api-key")
            .environment(Environment.PRODUCTION)
            .build();
        
        // Subscribe to real-time signals
        client.signals().subscribe()
            .symbols(List.of("BTCUSDT", "ETHUSDT"))
            .strategies(List.of("momentum", "breakout"))
            .onSignal(signal -> {
                System.out.println("New signal: " + signal.getSide() + 
                                 " " + signal.getSymbol());
                // Your trading logic here
            })
            .start();
    }
}`

const strategyExample = `// Custom Strategy Example
import { Strategy, Indicator } from '@tradingsignals/sdk';

class MomentumStrategy extends Strategy {
  constructor() {
    super({
      name: 'Custom Momentum',
      timeframe: '5m',
      symbols: ['BTCUSDT', 'ETHUSDT']
    });
  }

  async onCandle(candle) {
    const ema9 = await Indicator.EMA(9).calculate(candle.symbol);
    const ema21 = await Indicator.EMA(21).calculate(candle.symbol);
    const rsi = await Indicator.RSI(14).calculate(candle.symbol);
    
    // Long signal conditions
    if (ema9.value > ema21.value && 
        rsi.value > 50 && 
        rsi.slope > 0) {
      
      this.emitSignal({
        side: 'LONG',
        symbol: candle.symbol,
        price: candle.close,
        confidence: this.calculateConfidence(ema9, ema21, rsi),
        stopLoss: candle.close * 0.98,
        takeProfit: candle.close * 1.04,
        reason: 'EMA crossover + RSI momentum'
      });
    }
  }
  
  calculateConfidence(ema9, ema21, rsi) {
    const emaStrength = (ema9.value - ema21.value) / ema21.value;
    const rsiStrength = (rsi.value - 50) / 50;
    return Math.min(0.95, 0.6 + (emaStrength + rsiStrength) * 0.2);
  }
}`

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Signal className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-[var(--font-heading)]">TradingSignals Pro</h1>
            </Link>
            <Badge variant="secondary">Documentation</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card/50 min-h-screen p-6">
          <nav className="space-y-6">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Getting Started
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#quick-start" className="text-sm hover:text-primary">
                    Quick Start
                  </Link>
                </li>
                <li>
                  <Link href="#authentication" className="text-sm hover:text-primary">
                    Authentication
                  </Link>
                </li>
                <li>
                  <Link href="#installation" className="text-sm hover:text-primary">
                    Installation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                API Reference
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#signals-api" className="text-sm hover:text-primary">
                    Signals API
                  </Link>
                </li>
                <li>
                  <Link href="#strategies-api" className="text-sm hover:text-primary">
                    Strategies API
                  </Link>
                </li>
                <li>
                  <Link href="#backtesting-api" className="text-sm hover:text-primary">
                    Backtesting API
                  </Link>
                </li>
                <li>
                  <Link href="#webhooks" className="text-sm hover:text-primary">
                    Webhooks
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                SDKs & Examples
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#javascript-sdk" className="text-sm hover:text-primary">
                    JavaScript SDK
                  </Link>
                </li>
                <li>
                  <Link href="#python-sdk" className="text-sm hover:text-primary">
                    Python SDK
                  </Link>
                </li>
                <li>
                  <Link href="#java-sdk" className="text-sm hover:text-primary">
                    Java SDK
                  </Link>
                </li>
                <li>
                  <Link href="#strategy-examples" className="text-sm hover:text-primary">
                    Strategy Examples
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold font-[var(--font-heading)]">Developer Documentation</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Build powerful trading applications with our comprehensive API and SDKs. Get real-time signals, create
                custom strategies, and integrate with your trading systems.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button className="bg-primary hover:bg-primary/90">
                  <Code className="w-4 h-4 mr-2" />
                  Get API Key
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Examples
                </Button>
              </div>
            </div>

            {/* Quick Start */}
            <section id="quick-start" className="space-y-6">
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold font-[var(--font-heading)]">Quick Start</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>1. Get API Key</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Sign up for a free account and generate your API key from the dashboard.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <Database className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>2. Install SDK</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred language and install our official SDK.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <Globe className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>3. Start Trading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Subscribe to signals and start receiving real-time trading opportunities.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <CodeBlock code={quickStartCode} language="javascript" title="Quick Start Example" filename="index.js" />
            </section>

            {/* SDK Examples */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3">
                <Code className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold font-[var(--font-heading)]">SDK Examples</h2>
              </div>

              <Tabs defaultValue="javascript" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="java">Java</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript" className="space-y-4">
                  <CodeBlock
                    code={quickStartCode}
                    language="javascript"
                    title="JavaScript SDK"
                    filename="trading-bot.js"
                  />
                </TabsContent>

                <TabsContent value="python" className="space-y-4">
                  <CodeBlock code={pythonExample} language="python" title="Python SDK" filename="trading_bot.py" />
                </TabsContent>

                <TabsContent value="java" className="space-y-4">
                  <CodeBlock code={javaExample} language="java" title="Java SDK" filename="TradingBot.java" />
                </TabsContent>
              </Tabs>
            </section>

            {/* API Reference */}
            <section id="signals-api" className="space-y-6">
              <div className="flex items-center space-x-3">
                <Book className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold font-[var(--font-heading)]">API Reference</h2>
              </div>

              <div className="space-y-6">
                <ApiEndpoint
                  method="GET"
                  endpoint="/api/v1/signals"
                  description="Get latest trading signals"
                  parameters={[
                    { name: "symbols", type: "string[]", required: false, description: "Filter by trading symbols" },
                    { name: "strategies", type: "string[]", required: false, description: "Filter by strategy names" },
                    {
                      name: "limit",
                      type: "number",
                      required: false,
                      description: "Maximum number of signals to return (default: 50)",
                    },
                    {
                      name: "confidence_min",
                      type: "number",
                      required: false,
                      description: "Minimum confidence threshold (0-1)",
                    },
                  ]}
                  response={`{
  "signals": [
    {
      "id": "sig_123456",
      "symbol": "BTCUSDT",
      "side": "LONG",
      "price": 67234.50,
      "confidence": 0.87,
      "timestamp": "2024-01-15T10:30:00Z",
      "strategy": "momentum_scalper",
      "reason": "EMA crossover + volume spike",
      "stop_loss": 65750.00,
      "take_profit": 69500.00,
      "risk_reward": 1.5
    }
  ],
  "total": 1,
  "page": 1,
  "has_more": false
}`}
                  example={`const response = await fetch('/api/v1/signals?symbols=BTCUSDT,ETHUSDT&limit=10', {
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log('Latest signals:', data.signals);`}
                />

                <ApiEndpoint
                  method="POST"
                  endpoint="/api/v1/strategies"
                  description="Create a custom trading strategy"
                  parameters={[
                    { name: "name", type: "string", required: true, description: "Strategy name" },
                    { name: "description", type: "string", required: false, description: "Strategy description" },
                    { name: "config", type: "object", required: true, description: "Strategy configuration" },
                    { name: "symbols", type: "string[]", required: true, description: "Trading symbols" },
                  ]}
                  response={`{
  "strategy": {
    "id": "strat_789012",
    "name": "Custom Momentum",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "performance": {
      "total_signals": 0,
      "win_rate": 0,
      "avg_return": 0
    }
  }
}`}
                  example={`const strategy = await fetch('/api/v1/strategies', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Custom Momentum',
    symbols: ['BTCUSDT', 'ETHUSDT'],
    config: {
      timeframe: '5m',
      indicators: {
        ema_fast: 9,
        ema_slow: 21,
        rsi_period: 14
      }
    }
  })
});`}
                />
              </div>
            </section>

            {/* Strategy Examples */}
            <section id="strategy-examples" className="space-y-6">
              <div className="flex items-center space-x-3">
                <Signal className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold font-[var(--font-heading)]">Strategy Examples</h2>
              </div>

              <CodeBlock
                code={strategyExample}
                language="javascript"
                title="Custom Momentum Strategy"
                filename="momentum-strategy.js"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-[var(--font-heading)]">Mean Reversion Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Identifies oversold/overbought conditions using RSI and Bollinger Bands.
                    </p>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      View Example
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-[var(--font-heading)]">Breakout Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Detects price breakouts from consolidation patterns with volume confirmation.
                    </p>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      View Example
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Support */}
            <section className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold font-[var(--font-heading)]">Need Help?</h2>
                <p className="text-muted-foreground">
                  Our developer support team is here to help you build amazing trading applications.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button variant="outline">Join Discord</Button>
                  <Button variant="outline">Contact Support</Button>
                  <Button className="bg-primary hover:bg-primary/90">Schedule Demo</Button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
