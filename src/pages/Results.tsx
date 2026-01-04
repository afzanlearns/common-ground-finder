import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ScoreCircle } from "@/components/results/ScoreCircle";
import { AlternativeCard } from "@/components/results/AlternativeCard";
import { MetricCard } from "@/components/results/MetricCard";
import { Calendar, MapPin, HelpCircle, Users, Globe, Check, RefreshCw, ArrowUpRight } from "lucide-react";

const Results = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="app" />

      <main className="flex-1 py-10 md:py-16">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 animate-fade-in">
            <span>Planning</span>
            <span>/</span>
            <span>Sessions</span>
            <span>/</span>
            <span className="text-foreground">Optimization Result</span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10 animate-fade-in">
            <div>
              <h1 className="heading-display text-4xl md:text-5xl mb-3">
                <span className="font-semibold">Results</span> Dashboard
              </h1>
              <p className="text-muted-foreground italic font-serif max-w-lg border-l-2 border-primary/30 pl-4">
                AI-driven analysis for optimal event scheduling based on availability, interest, and fairness.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Live Calculation
              </div>
              <p className="text-xs text-muted-foreground">
                ID: 402-XC-99 • <span className="font-medium">1.24s</span> process time
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Primary Recommendation Card */}
              <section className="card-elevated p-6 md:p-8 animate-slide-up">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Check className="h-4 w-4" />
                    Recommended Plan
                  </div>
                  <ScoreCircle score={94} />
                </div>

                <h2 className="font-serif text-3xl md:text-4xl mb-6">Cloud Hero Workshop</h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="label-uppercase text-muted-foreground">Date & Time</span>
                    </div>
                    <p className="font-medium">Saturday, Nov 12</p>
                    <p className="text-sm text-muted-foreground">14:00 - 17:00 (3 hours)</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="label-uppercase text-muted-foreground">Venue</span>
                    </div>
                    <p className="font-medium">Downtown Co-working Hub</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-xs bg-card border border-border">Room 4B</span>
                      <span className="text-sm text-muted-foreground">Capacity: 40</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="label-uppercase text-foreground mb-2">Why This Option?</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        This selection maximizes attendance probability (<span className="font-medium text-foreground">n=18</span>) while maintaining the lowest location variance (<span className="font-medium text-foreground">4km</span>). The topic "Cloud Architecture" aligns with the interests of 85% of available members for this specific time slot, creating the most equitable outcome.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Alternative Scenarios */}
              <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-2xl">Alternative Scenarios</h3>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    View Full Report
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <AlternativeCard
                    option="Option B"
                    score={88}
                    title="Friday Night Social"
                    datetime="Fri, Nov 11 @ 19:00"
                    venue="The Local Pub"
                    pros={["Higher topic interest (+5%)"]}
                    cons={["Location variance (+12km)"]}
                  />
                  <AlternativeCard
                    option="Option C"
                    score={82}
                    title="Sunday Deep Dive"
                    datetime="Sun, Nov 13 @ 10:00"
                    venue="Online"
                    pros={["Perfect fairness (0km)"]}
                    cons={["Lowest availability (12/20)"]}
                  />
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <MetricCard
                icon={<Users className="h-4 w-4" />}
                label="Availability"
                value="18"
                subtext="/ 20 Members"
                detail="90% of core team is available."
              />
              <MetricCard
                icon={<Globe className="h-4 w-4" />}
                label="Travel Delta"
                value="4.2"
                subtext="km"
                detail="Standard deviation from central hub is low."
              />

              {/* Decision Actions */}
              <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
                <h3 className="label-uppercase text-center mb-4">Decision Actions</h3>
                <div className="space-y-3">
                  <Button variant="hero" size="lg" className="w-full gap-2">
                    <Check className="h-4 w-4" />
                    Confirm Selection
                  </Button>
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Options
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  GDG Event Planner AI v2.4
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
