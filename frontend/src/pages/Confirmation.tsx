import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Check, Calendar, MapPin, Users, HelpCircle, ArrowLeft, ExternalLink, Mail } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { toast } from "sonner";

const Confirmation = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [groupInfo, setGroupInfo] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendeeEmails, setAttendeeEmails] = useState<string[]>([]);

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        // Fetch latest result
        const resSnap = await getDoc(doc(db, "groups", groupId, "results", "latest"));
        let currentResult = null;
        if (resSnap.exists()) {
          currentResult = resSnap.data();
          setResult(currentResult);
        }

        // Fetch group details
        const groupSnap = await getDoc(doc(db, "groups", groupId));
        if (groupSnap.exists()) {
          const data = groupSnap.data();
          setGroupInfo({
            title: data.title || "Group Event",
            description: data.description || ""
          });
        }

        // Fetch Attendee Emails
        if (currentResult?.bestOption?.attendees) {
          const participantsSnap = await getDocs(collection(db, "groups", groupId, "participants"));
          const emails = participantsSnap.docs
            .filter(doc => currentResult.bestOption.attendees.includes(doc.id) || currentResult.bestOption.attendees.includes(doc.data().userId))
            .map(doc => doc.data().email)
            .filter(email => !!email);
          setAttendeeEmails(emails);
        }
      } catch (error) {
        console.error("Error fetching confirmation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const generateGoogleCalendarLink = () => {
    if (!result || !result.bestOption) return "#";

    const { bestOption } = result;
    const title = encodeURIComponent(`${groupInfo?.title || "Event"}: ${bestOption.title}`);
    
    // Parse timeSlot: "MON, 09:00 - 11:00"
    const timeSlot = bestOption.timeSlot || "";
    const dayPart = timeSlot.split(", ")[0];
    const timeRange = timeSlot.split(", ")[1] || "09:00 - 11:00";
    const [startH, endH] = timeRange.split(" - ");

    // Helper to get next weekday
    const getNextDayDate = (dayName: string) => {
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const target = days.indexOf(dayName.toUpperCase());
      const now = new Date();
      const resultDate = new Date();
      resultDate.setDate(now.getDate() + (target + 7 - now.getDay()) % 7);
      if (resultDate <= now) resultDate.setDate(resultDate.getDate() + 7);
      return resultDate;
    };

    const eventDate = dayPart ? getNextDayDate(dayPart) : new Date();
    const dateStr = eventDate.toISOString().split("T")[0].replace(/-/g, "");
    
    const startTimeStr = startH.replace(":", "") + "00";
    const endTimeStr = endH.replace(":", "") + "00";
    
    const dates = `${dateStr}T${startTimeStr}/${dateStr}T${endTimeStr}`;
    const location = encodeURIComponent(bestOption.location || "Online");
    const details = encodeURIComponent(`${bestOption.description}\n\nRecommended by Common Ground Finder.\nAttendees: ${attendeeEmails.join(", ")}`);
    const guests = attendeeEmails.join(",");

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&add=${guests}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading final details...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Error loading confirmation details.</p>
      </div>
    );
  }

  const { bestOption } = result;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="app" />

      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-3xl mx-auto px-4">

          {/* 1. Header & Status */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium mb-6 border border-success/20">
              <Check className="h-4 w-4" />
              Decision Reached Collectively
            </div>
            <h1 className="heading-display text-4xl mb-3">{groupInfo?.title}</h1>
            {groupInfo?.description && (
              <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
                {groupInfo.description}
              </p>
            )}
          </div>

          {/* 2. Final Decision Card */}
          <div className="card-elevated overflow-hidden mb-10 animate-slide-up border-primary/20 shadow-2xl relative">
            <div className="absolute top-4 right-4 group">
               <div className="h-2 w-2 rounded-full bg-primary animate-ping absolute" />
               <div className="h-2 w-2 rounded-full bg-primary relative" />
            </div>
            <div className="bg-primary/5 p-8 border-b border-border/50 text-center">
              <p className="label-uppercase text-primary/80 mb-2">Final Consensus</p>
              <h2 className="heading-display text-4xl md:text-5xl mb-4 text-primary">{bestOption?.title}</h2>
              <p className="text-muted-foreground font-medium">
                This option satisfies the majority of group preferences using our fairness algorithm.
              </p>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-8 bg-card/50 backdrop-blur-sm border-b border-border/50">
              {/* Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted text-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="label-uppercase">When</p>
                    <p className="text-lg font-medium">{bestOption?.timeSlot || "Date TBD"}</p>
                    <p className="text-sm text-muted-foreground">{bestOption?.duration || 2} hours duration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted text-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="label-uppercase">Where</p>
                    <p className="text-lg font-medium">{bestOption?.location || "Location TBD"}</p>
                    <p className="text-sm text-muted-foreground">Chosen for central convenience</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-background/50">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Attendance</span>
                  </div>
                  <span className="text-xl font-bold">{bestOption?.attendees?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-background/50">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Fairness Score</span>
                  </div>
                  <span className="text-xl font-bold text-primary">{Math.round(bestOption?.fairnessScore || 0)}/100</span>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="p-6 bg-muted/20 flex flex-col sm:flex-row gap-4 justify-center items-center">
               <Button 
                variant="hero" 
                size="lg" 
                className="w-full sm:w-auto gap-2"
                onClick={() => {
                  window.open(generateGoogleCalendarLink(), "_blank");
                  toast.success("Opening Google Calendar. Click 'Save' to invite all attendees!");
                }}
               >
                 <ExternalLink className="h-4 w-4" />
                 Confirm & Create Calendar Event
               </Button>
               <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto gap-2"
                onClick={() => {
                   const subject = encodeURIComponent(`Meeting Invite: ${bestOption.title}`);
                   const body = encodeURIComponent(`Hi everyone,\n\nOur meeting has been confirmed for ${bestOption.timeSlot} at ${bestOption.location}.\n\nLooking forward to seeing you there!\n\nSent via Common Ground Finder.`);
                   window.location.href = `mailto:${attendeeEmails.join(",")}?subject=${subject}&body=${body}`;
                }}
               >
                 <Mail className="h-4 w-4" />
                 Notify Attendees
               </Button>
            </div>
          </div>

          {/* 3. Why This Was Chosen */}
          <div className="mb-12 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="p-6 rounded-xl border border-border/60 bg-muted/10">
              <h3 className="font-serif text-xl mb-4">Why this plan won</h3>
              <div className="space-y-3">
                {result?.explanation ? (
                  <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                    "{result.explanation}"
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Highest overlap in availability and topic interest.
                  </p>
                )}
                <ul className="grid sm:grid-cols-2 gap-4 mt-4">
                  <li className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Optimized for travel time</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Maximizes participant count</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Decision Disclaimer */}
          <div className="mb-10 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="p-6 rounded-xl border border-border/60 bg-muted/10 text-center max-w-lg mx-auto">
              <p className="text-foreground/90 font-medium mb-2">
                This decision was made based on the preferences of participating members at the time of finalization.
              </p>
              <p className="text-sm text-muted-foreground">
                Members who join later can still view this outcome.
              </p>
            </div>
          </div>

          {/* 5. Closure & Actions */}
          <div className="text-center animate-slide-up" style={{ animationDelay: "300ms" }}>
            <p className="text-muted-foreground italic mb-8 text-lg">
              "You’ve successfully guided your group to a fair decision."
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" onClick={() => navigate("/")} className="gap-2 hover:bg-muted">
                <ArrowLeft className="h-4 w-4" />
                Return to Dashboard
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Confirmation;
