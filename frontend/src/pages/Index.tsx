import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ValueCard } from "@/components/landing/ValueCard";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";
import { Heart, Clock, MapPin, Plus, LinkIcon, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header variant="landing" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <BackgroundAnimation />
          <div className="container py-12 md:py-20 lg:py-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left: Headline */}
              <div className="space-y-6 animate-fade-in">
                <h1 className="heading-display text-5xl md:text-6xl lg:text-7xl text-balance">
                  Consensus,
                  <br />
                  <span className="heading-display-italic text-primary">elegantly found.</span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  A decision-support tool that helps groups reach fair agreements. We balance individual preferences privately and explain the outcome transparently, so everyone feels heard.
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex -space-x-2">
                    {["JD", "AK", "ML"].map((initials, i) => (
                      <div
                        key={initials}
                        style={{ animationDelay: `${i * 100}ms` }}
                        className="h-9 w-9 rounded-full border-2 border-background bg-accent/50 flex items-center justify-center text-xs font-medium transition-all duration-300 hover:scale-110 hover:z-10 hover:shadow-md animate-fade-in"
                      >
                        {initials}
                      </div>
                    ))}
                    <div className="h-9 w-9 rounded-full border-2 border-background bg-accent/50 flex items-center justify-center text-xs font-medium transition-all duration-300 hover:scale-110 hover:z-10 hover:shadow-md animate-fade-in" style={{ animationDelay: '300ms' }}>
                      +5
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trusted by <span className="font-medium text-foreground story-link cursor-pointer">GDG Leads</span> worldwide.
                  </p>
                </div>
              </div>

              {/* Right: Action Card */}
              <div className="card-elevated p-8 animate-slide-up lg:ml-auto lg:max-w-md w-full hover:shadow-xl transition-all duration-500 lg:-mt-12">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-serif text-2xl">Start a Decision</h2>
                  <Calendar className="h-5 w-5 text-muted-foreground transition-transform duration-300 hover:scale-110 hover:text-primary" />
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  Initiate a group process to find common ground.
                </p>

                <div className="space-y-3">
                  <Button variant="card" className="w-full justify-between h-auto p-4 group" asChild>
                    <Link to="/create-group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg border border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary/30 group-hover:bg-accent/50 group-hover:scale-105">
                          <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium transition-colors duration-300 group-hover:text-primary">Create New Group</div>
                          <div className="text-xs text-muted-foreground text-wrap pr-2">Create a private space & invite others.</div>
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </Button>

                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">Or Join</span>
                    </div>
                  </div>

                  <Button variant="card" className="w-full justify-start h-auto p-4 group" asChild>
                    <Link to="/join-group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg border border-border flex items-center justify-center transition-all duration-300 group-hover:border-primary/30 group-hover:bg-accent/50 group-hover:scale-105">
                          <LinkIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium transition-colors duration-300 group-hover:text-primary">Join with Code</div>
                          <div className="text-xs text-muted-foreground text-wrap pr-2">Enter your invite code for an existing group.</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1.5 transition-colors duration-300 hover:text-foreground cursor-default">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  We help groups reach agreement. Execution happens on your terms.
                </p>

                <div className="mt-6 border-t border-border/50 pt-4">
                  <div className="flex justify-between items-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    <span>Create</span>
                    <span className="text-border">→</span>
                    <span>Collect</span>
                    <span className="text-border">→</span>
                    <span>Decide</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                    Start a group • Gather preferences • Get a fair outcome
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="bg-accent/20 border-y border-border/50">
          <div className="container py-16 md:py-24">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <ValueCard
                  icon={<Heart className="h-5 w-5" />}
                  title="Fair Outcomes"
                  description="We analyze everyone's preferences to find options that work for the whole group, not just the loudest voice."
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <ValueCard
                  icon={<Clock className="h-5 w-5" />}
                  title="Inclusive Scheduling"
                  description="Identify times that maximize attendance, balancing busy schedules without the back-and-forth."
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <ValueCard
                  icon={<MapPin className="h-5 w-5" />}
                  title="Stress-Free Logistics"
                  description="Automatically find central locations that share the travel effort equitably among all participants."
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

