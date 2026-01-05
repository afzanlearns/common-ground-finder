import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/layout/Header";
import { InterestChip } from "@/components/preferences/InterestChip";
import { AvailabilityGrid } from "@/components/preferences/AvailabilityGrid";
import { ArrowRight } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

const TOPICS = [
  "Web Technologies",
  "AI/Machine Learning",
  "Cloud Computing",
  "Mobile Dev",
  "UI/UX Design",
  "Career Growth",
];

const Preferences = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");
  const [groupTitle, setGroupTitle] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, { am: boolean; pm: boolean }>>({
    MON: { am: false, pm: false },
    TUE: { am: false, pm: false },
    WED: { am: false, pm: false },
    THU: { am: false, pm: false },
    FRI: { am: false, pm: false },
    SAT: { am: false, pm: false },
    SUN: { am: false, pm: false },
  });
  const [location, setLocation] = useState("");
  const [travelRadius, setTravelRadius] = useState([15]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!groupId) {
      // Allow testing without groupId, but warn
      // toast.error("No Group ID provided");
      setGroupTitle("Demo Group");
      return;
    }
    const fetchGroup = async () => {
      try {
        const docRef = doc(db, "groups", groupId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setGroupTitle(snap.data().title);
        } else {
          setGroupTitle("Unknown Group");
        }
      } catch (e) {
        console.error("Error fetching group", e);
      }
    };
    fetchGroup();
  }, [groupId]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const toggleAvailability = (day: string, period: "am" | "pm") => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day] || { am: false, pm: false },
        [period]: !prev[day]?.[period],
      },
    }));
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!groupId) {
      toast.error("Invalid Group ID");
      return;
    }

    setIsLoading(true);
    try {
      // Convert availability to simplistic list of strings for the backend
      const days: string[] = [];
      const times: string[] = [];

      // Simple mapping: if ANY time in a day is selected, add the day.
      Object.entries(availability).forEach(([day, slots]) => {
        if (slots.am || slots.pm) {
          days.push(day); // MON, TUE...
          if (slots.am) times.push(`${day}-AM`);
          if (slots.pm) times.push(`${day}-PM`);
        }
      });

      // Backend expects 'days' and 'times' arrays. 
      // We will just pass the raw days for now, as the simple solver handles days overlap.

      await setDoc(doc(db, "groups", groupId, "participants", auth.currentUser.uid), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        topics: selectedTopics,
        location: location,
        travelRadius: travelRadius[0],
        availability: {
          days: days, // ["MON", "WED"]
          times: times // ["MON-AM", "WED-PM"]
        },
        notes: notes,
        updatedAt: new Date()
      });

      toast.success("Preferences saved!");
      navigate(`/results?groupId=${groupId}`);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to save: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="app" />

      <main className="flex-1 py-10 md:py-16">
        <div className="container max-w-4xl">
          {/* Page Header */}
          <div className="mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground">
                Participant Input
              </span>
            </div>

            <h1 className="heading-display text-4xl md:text-5xl mb-3">
              Preferences for <span className="heading-display-italic text-primary">{groupTitle}</span>
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Help shape the event. Share your availability and interests.
            </p>
          </div>

          <div className="space-y-6">
            {/* Interests Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up relative">
              <span className="absolute top-3 right-6 text-[10px] italic text-primary">Required</span>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="font-serif text-2xl mb-0">Interests</h2>
                  <p className="text-sm text-muted-foreground">
                    Select the topics you are most passionate about.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {TOPICS.map((topic) => (
                    <InterestChip
                      key={topic}
                      label={topic}
                      selected={selectedTopics.includes(topic)}
                      onClick={() => toggleTopic(topic)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Availability Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up relative" style={{ animationDelay: "50ms" }}>
              <span className="absolute top-3 right-6 text-[10px] italic text-primary">Required</span>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="font-serif text-2xl mb-0">Availability</h2>
                  <p className="text-sm text-muted-foreground">
                    Mark your free slots.
                  </p>
                </div>
                <AvailabilityGrid
                  availability={availability}
                  onToggle={toggleAvailability}
                />
              </div>
            </section>

            {/* Location Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up relative" style={{ animationDelay: "150ms" }}>
              <span className="absolute top-3 right-6 text-[10px] italic text-primary">Required</span>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="font-serif text-2xl mb-0">Location</h2>
                  <p className="text-sm text-muted-foreground">
                    Where are you joining from?
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label-uppercase text-muted-foreground">City / Zip</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. New York, NY"
                      className="border-t-0 border-x-0 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="label-uppercase text-muted-foreground">Travel Radius</label>
                      <span className="font-serif text-xl">{travelRadius[0]} km</span>
                    </div>
                    <Slider
                      value={travelRadius}
                      onValueChange={setTravelRadius}
                      max={50}
                      min={1}
                      step={1}
                      className="py-2"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Notes Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up relative" style={{ animationDelay: "200ms" }}>
              <span className="absolute top-3 right-6 text-[10px] italic text-muted-foreground">Optional</span>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="font-serif text-2xl mb-0">Notes</h2>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="E.g., I need wheelchair access..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </section>

            {/* Submit Bar */}
            <div className="card-elevated p-4 flex flex-wrap items-center justify-end gap-4 animate-slide-up">
              <Button variant="outline" disabled={isLoading}>Save Draft</Button>
              <Button variant="hero" className="gap-2" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Submit Preferences"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Preferences;
