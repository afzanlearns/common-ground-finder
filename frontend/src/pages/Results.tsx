import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ScoreCircle } from "@/components/results/ScoreCircle";
import { AlternativeCard } from "@/components/results/AlternativeCard";
import { MetricCard } from "@/components/results/MetricCard";
import { Calendar, MapPin, HelpCircle, Users, Globe, Check, RefreshCw, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupId = searchParams.get("groupId");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const unsub = onSnapshot(doc(db, "groups", groupId, "results", "latest"), (doc) => {
      if (doc.exists()) {
        setResult(doc.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, [groupId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header variant="app" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-serif">Waiting for Responses...</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            We need more participants to submit their preferences before we can calculate the best option.
          </p>
          <Button asChild>
            <Link to={`/preferences?groupId=${groupId}`}>Submit Your Preferences</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { bestOption, alternatives, fairnessScore } = result;

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
              {result.isDemoData && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-widest border border-amber-500/20">
                   Demo Mode
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Live Calculation
              </div>
              <p className="text-xs text-muted-foreground">
                Fairness Score: <span className="font-medium">{(fairnessScore || 0)} / 100</span>
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
                  <ScoreCircle score={Math.round(fairnessScore || 0)} />
                </div>

                <h2 className="font-serif text-3xl md:text-4xl mb-6">{bestOption?.title || "Unknown Option"}</h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="label-uppercase text-muted-foreground">Date & Time</span>
                    </div>
                    <p className="font-medium">{bestOption?.timeSlot || "TBD"}</p>
                    <p className="text-sm text-muted-foreground">Duration: {bestOption?.duration || 2} hours</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="label-uppercase text-muted-foreground">Venue</span>
                    </div>
                    <p className="font-medium">Venue Online</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{bestOption?.location || "No Location Specified"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="label-uppercase text-foreground mb-2">Why this option was recommended</h3>

                      {result?.explanation ? (
                        <>
                          <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3 py-1 mb-2">
                            "{result.explanation}"
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 opacity-75">
                            <div className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI-assisted explanation</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {bestOption?.description || "This option balances everyone's availability and preferences."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Alternative Scenarios */}
              <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-2xl">Alternative Scenarios</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => {
                        const BACKEND_URL = 'https://common-ground-finder-pa54.vercel.app/';
                        fetch(BACKEND_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ groupId })
                        }).then(() => toast.success("Recalculation triggered!"));
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Recalculate
                  </Button>
                </div>
                {alternatives && alternatives.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {alternatives.map((alt: any, idx: number) => (
                      <AlternativeCard
                        key={idx}
                        option={`Alternative Plan`}
                        score={Math.round(alt.fairnessScore || 0)}
                        title={alt.title}
                        datetime={alt.timeSlot}
                        venue={alt.location}
                        pros={[]}
                        cons={[]}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No better alternatives found.</p>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <MetricCard
                icon={<Users className="h-4 w-4" />}
                label="Attendance"
                value={bestOption?.attendees?.length?.toString() || "0"}
                subtext="Members"
                detail="Estimated attendance based on availability."
              />
              <MetricCard
                icon={<Globe className="h-4 w-4" />}
                label="Average Travel"
                value={bestOption?.avgDistance !== undefined ? bestOption.avgDistance.toFixed(1) : "0.0"}
                subtext="km"
                detail="Average distance for attendees clusters."
              />

              {/* Decision Actions */}
              <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
                <h3 className="label-uppercase text-center mb-4">Decision Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => navigate(`/confirmation?groupId=${groupId}`)}
                  >
                    <Check className="h-4 w-4" />
                    Confirm and Send Invites
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Common Ground Finder v1.0
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
