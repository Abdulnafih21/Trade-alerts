"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Signal, Users, Target, Award, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"

const team = [
  {
    name: "Alex Chen",
    role: "CEO & Co-Founder",
    bio: "Former Goldman Sachs quant with 15+ years in algorithmic trading. PhD in Computer Science from MIT.",
    image: "/trader-avatar.png",
  },
  {
    name: "Sarah Rodriguez",
    role: "CTO & Co-Founder",
    bio: "Ex-Google engineer specializing in machine learning and high-frequency trading systems.",
    image: "/quant-trader.png",
  },
  {
    name: "Michael Kim",
    role: "Head of Research",
    bio: "Former Renaissance Technologies researcher with expertise in quantitative finance and AI.",
    image: "/algorithmic-trader.png",
  },
  {
    name: "Emma Thompson",
    role: "Head of Product",
    bio: "Product leader from Robinhood, focused on making complex trading tools accessible to everyone.",
    image: "/ai-trader.png",
  },
]

const milestones = [
  {
    year: "2020",
    title: "Company Founded",
    description: "Started with a vision to democratize professional trading tools",
  },
  { year: "2021", title: "Series A Funding", description: "Raised $10M to build our core platform and team" },
  { year: "2022", title: "Platform Launch", description: "Launched beta platform with 1,000 early adopters" },
  { year: "2023", title: "Global Expansion", description: "Expanded to serve traders in 50+ countries" },
  { year: "2024", title: "AI Integration", description: "Launched advanced AI-powered signal generation" },
]

export default function AboutPage() {
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
            <Badge variant="secondary">About</Badge>
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold font-[var(--font-heading)] mb-6">About TradingSignals Pro</h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're on a mission to democratize professional trading tools and make sophisticated market analysis
              accessible to traders worldwide.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="px-6 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card border-border text-center">
                <CardHeader>
                  <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-[var(--font-heading)]">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To level the playing field by providing retail traders with institutional-grade tools and insights
                    previously available only to hedge funds.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-[var(--font-heading)]">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    A world where every trader has access to the same quality of market analysis and trading signals,
                    regardless of their background or capital.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border text-center">
                <CardHeader>
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-[var(--font-heading)]">Our Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Transparency, innovation, and community. We believe in open-source principles and building tools
                    that truly serve our users' needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="px-6 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-[var(--font-heading)] mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our team combines decades of experience from top financial institutions, tech companies, and trading
                firms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="bg-card border-border text-center">
                  <CardHeader>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="font-[var(--font-heading)]">{member.name}</CardTitle>
                    <p className="text-sm text-primary">{member.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                    <div className="flex justify-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Twitter className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="px-6 mb-16 bg-muted/30 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-[var(--font-heading)] mb-4">Our Journey</h2>
              <p className="text-muted-foreground">From a small startup to serving thousands of traders worldwide.</p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {milestone.year}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold font-[var(--font-heading)] mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-3xl font-bold font-[var(--font-heading)] mb-4">Want to Learn More?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  We'd love to hear from you. Whether you're interested in our platform, have questions, or want to
                  explore partnership opportunities.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/careers">Join Our Team</Link>
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
