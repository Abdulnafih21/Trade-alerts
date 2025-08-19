"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Signal,
  TrendingUp,
  Brain,
  Users,
  Shield,
  Zap,
  BarChart3,
  Bell,
  Code,
  Globe,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Signal,
    title: "Real-Time Signals",
    description: "Get instant trading signals with confidence scores, stop-loss, and take-profit levels.",
    benefits: ["Sub-second latency", "95%+ accuracy", "Multi-asset coverage", "Risk management built-in"],
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze market patterns and sentiment.",
    benefits: ["Deep learning models", "News sentiment analysis", "Pattern recognition", "Predictive analytics"],
  },
  {
    icon: BarChart3,
    title: "Strategy Backtesting",
    description: "Test your strategies against historical data with realistic market conditions.",
    benefits: ["Walk-forward analysis", "Risk metrics", "Performance attribution", "Overfitting detection"],
  },
  {
    icon: Code,
    title: "Strategy Builder",
    description: "Create custom strategies with our visual builder or code editor.",
    benefits: ["No-code interface", "Multi-language support", "Template library", "Real-time testing"],
  },
  {
    icon: Users,
    title: "Community Sharing",
    description: "Share strategies, follow top performers, and learn from the community.",
    benefits: ["Strategy marketplace", "Performance leaderboards", "Social features", "Knowledge sharing"],
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Customizable alerts via email, push notifications, and webhooks.",
    benefits: ["Multi-channel delivery", "Smart filtering", "Throttling controls", "API integration"],
  },
]

const stats = [
  { label: "Active Traders", value: "50K+", icon: Users },
  { label: "Signals Generated", value: "2M+", icon: Signal },
  { label: "Average Accuracy", value: "87%", icon: TrendingUp },
  { label: "Markets Covered", value: "500+", icon: Globe },
]

export default function FeaturesPage() {
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
            <Badge variant="secondary">Features</Badge>
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

      <main className="py-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 px-6 mb-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold font-[var(--font-heading)] mb-6">Professional Trading Features</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to make informed trading decisions with confidence. From real-time signals to advanced
              backtesting, we've got you covered.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Zap className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-card border-border text-center">
                  <CardContent className="pt-6">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-[var(--font-heading)] mb-4">Powerful Features for Every Trader</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform combines cutting-edge technology with user-friendly design to deliver the tools you need
                for successful trading.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="font-[var(--font-heading)]">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="px-6 mb-16 bg-muted/30 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-[var(--font-heading)] mb-4">Built on Modern Technology</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform leverages the latest technologies to ensure reliability, speed, and scalability for
                professional traders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card border-border">
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Enterprise Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• End-to-end encryption</li>
                    <li>• SOC 2 Type II compliance</li>
                    <li>• Multi-factor authentication</li>
                    <li>• Regular security audits</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>High Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Sub-millisecond latency</li>
                    <li>• 99.9% uptime SLA</li>
                    <li>• Global CDN distribution</li>
                    <li>• Auto-scaling infrastructure</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Global Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 50+ cryptocurrency exchanges</li>
                    <li>• Major stock markets worldwide</li>
                    <li>• Forex and commodities</li>
                    <li>• Real-time data feeds</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-3xl font-bold font-[var(--font-heading)] mb-4">Ready to Start Trading Smarter?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Join thousands of traders who trust our platform for their trading decisions. Start with a free trial
                  and see the difference professional tools can make.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Schedule Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
