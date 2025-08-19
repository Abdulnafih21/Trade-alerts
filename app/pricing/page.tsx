"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Signal, Check, X, Zap, Crown, Rocket } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for beginners exploring trading signals",
    icon: Signal,
    features: [
      { name: "5 signals per day", included: true },
      { name: "Basic market data", included: true },
      { name: "Email alerts", included: true },
      { name: "Community access", included: true },
      { name: "Real-time signals", included: false },
      { name: "Advanced indicators", included: false },
      { name: "Strategy builder", included: false },
      { name: "Backtesting", included: false },
      { name: "API access", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For serious traders who need professional tools",
    icon: Zap,
    features: [
      { name: "Unlimited signals", included: true },
      { name: "Real-time market data", included: true },
      { name: "Multi-channel alerts", included: true },
      { name: "Community access", included: true },
      { name: "Real-time signals", included: true },
      { name: "Advanced indicators", included: true },
      { name: "Strategy builder", included: true },
      { name: "Basic backtesting", included: true },
      { name: "API access", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "per month",
    description: "For institutions and professional trading teams",
    icon: Crown,
    features: [
      { name: "Unlimited signals", included: true },
      { name: "Real-time market data", included: true },
      { name: "Multi-channel alerts", included: true },
      { name: "Community access", included: true },
      { name: "Real-time signals", included: true },
      { name: "Advanced indicators", included: true },
      { name: "Strategy builder", included: true },
      { name: "Advanced backtesting", included: true },
      { name: "Full API access", included: true },
      { name: "Priority support", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

const faqs = [
  {
    question: "Can I change my plan anytime?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing differences.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Pro and Enterprise plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee for all paid plans if you're not satisfied.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees.",
  },
]

export default function PricingPage() {
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
            <Badge variant="secondary">Pricing</Badge>
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
            <h1 className="text-5xl font-bold font-[var(--font-heading)] mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the plan that fits your trading needs. Start free and upgrade as you grow.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`bg-card border-border relative ${
                    plan.popular ? "border-primary shadow-lg scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <plan.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-2xl font-[var(--font-heading)]">{plan.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">
                        {plan.price}
                        {plan.price !== "Free" && (
                          <span className="text-lg text-muted-foreground">/{plan.period.split(" ")[1]}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-3">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={`text-sm ${!feature.included ? "text-muted-foreground" : ""}`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.popular ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"
                      }`}
                      asChild
                    >
                      <Link href="/signup">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-[var(--font-heading)] mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Got questions? We've got answers.</p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-[var(--font-heading)]">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold font-[var(--font-heading)] mb-4">Ready to Start Trading Smarter?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Join thousands of traders who trust our platform. Start with our free plan and upgrade when you're
                  ready for more advanced features.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                    <Link href="/signup">Start Free Today</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/contact">Contact Sales</Link>
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
