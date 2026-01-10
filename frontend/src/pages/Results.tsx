import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ScoreCircle } from "@/components/results/ScoreCircle";
import { AlternativeCard } from "@/components/results/AlternativeCard";
import { MetricCard } from "@/components/results/MetricCard";
import { Calendar, MapPin, HelpCircle, Users, Globe, Check, RefreshCw, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { toast } from "sonner";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupId = searchParams.get("groupId");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState<{ title: string; description: string; domain: string } | null>(null);

  useEffect(() => {
    if (!groupId) return;

    // Fetch Group Details for Header Context
    getDoc(doc(db, "groups", groupId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setGroupInfo({
          title: data.title,
          description: data.description || "",
          domain: data.domain || ""
        });
      }
    });

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
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="h-16 w-16 mb-6 relative">
             <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
             <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-serif mb-3">Analyzing Consensus...</h2>
          <p className="text-muted-foreground mb-8">
            We've received preferences, but our AI Solver is still finding the optimal "Common Ground." 
            This usually takes a few seconds.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Manually
            </Button>
            <Button asChild>
                <Link to={`/preferences?groupId=${groupId}`}>Update My Input</Link>
            </Button>
          </div>
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
                {groupInfo?.title || "Results Dashboard"}
              </h1>
              {groupInfo?.description && (
                <p className="text-muted-foreground text-lg mb-4 max-w-2xl">{groupInfo.description}</p>
              )}
              <div className="flex flex-col gap-1 border-l-2 border-primary/30 pl-4 mt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">Result For</p>
                <p className="font-serif text-xl italic text-foreground/90">{groupInfo?.domain || "General"} Preferences</p>
              </div>
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
                <span className="text-[10px] text-muted-foreground ml-1 border-l border-border pl-2">Updated just now</span>
              </div>
            </div>
          </div>


          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Primary Recommendation Card */}
              <section className="card-elevated p-6 md:p-8 animate-slide-up">
                <div className="mb-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium w-fit mb-3">
                        <Check className="h-4 w-4" />
                        Recommended Plan
                      </div>
                      <h2 className="font-serif text-3xl md:text-4xl leading-tight text-foreground">
                        {bestOption?.title || "Unknown Option"}
                      </h2>
                    </div>
                    <ScoreCircle score={Math.round(fairnessScore || 0)} />
                  </div>

                  <div className="pl-4 border-l-2 border-primary/30">
                    <p className="text-lg font-medium text-foreground mb-1">
                      Why this won:
                    </p>
                    {result?.explanation ? (
                      <p className="text-muted-foreground leading-relaxed italic">
                        "{result.explanation}"
                      </p>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">
                        This option maximizes group attendance while maintaining the highest fairness score, ensuring no single member is significantly disadvantaged.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-5 border border-border/50 mb-6">
                  <h3 className="label-uppercase text-muted-foreground mb-4">Why this plan works</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Users className="h-3.5 w-3.5" /> Attendance
                      </div>
                      <p className="text-xl font-medium">{bestOption?.attendees?.length || 0} Members</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <ArrowUpRight className="h-3.5 w-3.5" /> Fairness
                      </div>
                      <p className="text-xl font-medium">{Math.round(fairnessScore || 0)}/100</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <MapPin className="h-3.5 w-3.5" /> Mode
                      </div>
                      <p className="text-xl font-medium capitalize">{bestOption?.meetingMode || "Online"}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Globe className="h-3.5 w-3.5" /> Avg Travel
                      </div>
                      <p className="text-xl font-medium">{bestOption?.avgDistance !== undefined ? bestOption.avgDistance.toFixed(1) : "0"} km</p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Date & Time</span>
                    </div>
                    <p className="font-medium text-lg">{bestOption?.timeSlot || "TBD"}</p>
                    <p className="text-sm text-muted-foreground">Duration: {bestOption?.duration || 2} hours</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/60">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Location</span>
                    </div>
                    <p className="font-medium text-lg">{bestOption?.location || "TBD"}</p>
                    <p className="text-sm text-muted-foreground">
                      {bestOption?.meetingMode === "Online" 
                        ? "Virtual Venue selected for accessibility." 
                        : "Consensus Location selected for central convenience."}
                    </p>
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
                    {alternatives.map((alt: any, idx: number) => {
                      const scoreDiff = (fairnessScore || 0) - (alt.fairnessScore || 0);
                      let label = "";
                      if (scoreDiff < 5) label = "Close Match";
                      else if ((alt.attendees?.length || 0) < (bestOption?.attendees?.length || 0)) label = "Lower Attendance";
                      else label = "Lower Fairness";

                      return (
                        <AlternativeCard
                          key={idx}
                          option={`Alternative Plan`}
                          score={Math.round(alt.fairnessScore || 0)}
                          title={alt.title}
                          datetime={alt.timeSlot}
                          venue={alt.location}
                          pros={[]}
                          cons={[]}
                          tradeoffLabel={label}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No better alternatives found.</p>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-muted/10 rounded-xl p-5 border border-border/50">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-primary" />
                  Impact Overview
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Beneficiaries</span>
                    <span className="font-medium">{bestOption?.attendees?.length || 0} members</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Left out</span>
                    <span className="font-medium">{(result?.totalParticipants || 0) - (bestOption?.attendees?.length || 0)} members</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug pt-1">
                    {fairnessScore < 40 
                      ? "This plan represents a focused compromise for a subset of the group." 
                      : fairnessScore < 70 
                      ? "This plan balances the majority of group preferences effectively."
                      : "This plan achieves exceptional alignment across all participants."}
                  </p>
                </div>
              </div>

              {/* Decision Actions */}
              <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
                <h3 className="label-uppercase text-center mb-4">Decision Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full gap-2 text-base px-8 h-12 shadow-md hover:shadow-xl transition-all"
                    onClick={() => navigate(`/confirmation?groupId=${groupId}`)}
                  >
                    Confirm Plan & Send Invites
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link to={`/preferences?groupId=${groupId}`}>Review Preferences</Link>
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-4 px-4 leading-relaxed">
                  Confirming locks this plan and notifies all participants via email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main >
    </div >
  );
};

export default Results;
