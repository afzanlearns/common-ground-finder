import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/layout/Header";
import { InterestChip } from "@/components/preferences/InterestChip";
import { AvailabilityGrid } from "@/components/preferences/AvailabilityGrid";
import { ArrowRight } from "lucide-react";

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
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Web Technologies", "Mobile Dev"]);
  const [availability, setAvailability] = useState<Record<string, { am: boolean; pm: boolean }>>({
    MON: { am: false, pm: true },
    TUE: { am: false, pm: false },
    WED: { am: true, pm: true },
    THU: { am: false, pm: false },
    FRI: { am: false, pm: true },
  });
  const [location, setLocation] = useState("Berlin Mitte");
  const [travelRadius, setTravelRadius] = useState([15]);
  const [notes, setNotes] = useState("");

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
        ...prev[day],
        [period]: !prev[day]?.[period],
      },
    }));
  };

  const handleSubmit = () => {
    navigate("/results");
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
                Strategy
              </span>
              <span className="text-sm text-muted-foreground">— Q3 2024</span>
            </div>

            <h1 className="heading-display text-4xl md:text-5xl mb-3">
              Group <span className="heading-display-italic text-primary">Preferences</span>
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Help shape the next DevFest season. Share your availability and interests to align with the team's vision.
            </p>
          </div>

          <div className="space-y-6">
            {/* Interests Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up">
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div>
                  <h2 className="font-serif text-2xl mb-2">Interests</h2>
                  <p className="text-sm text-muted-foreground">
                    Select the topics you are most passionate about discussing this quarter.
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
            <section className="card-elevated p-6 md:p-8 animate-slide-up" style={{ animationDelay: "50ms" }}>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div>
                  <h2 className="font-serif text-2xl mb-2">Availability</h2>
                  <p className="text-sm text-muted-foreground">
                    Mark your free slots. The system will auto-match common times.
                  </p>
                </div>
                <AvailabilityGrid
                  availability={availability}
                  onToggle={toggleAvailability}
                />
              </div>
            </section>

            {/* Status Bar */}
            <div className="card-elevated p-4 flex flex-wrap items-center justify-between gap-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-card bg-muted"
                    />
                  ))}
                  <div className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs">
                    ...
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Waiting...</p>
                  <p className="text-xs text-muted-foreground">3/5 Joined</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline">Save Draft</Button>
                <Button variant="hero" className="gap-2" onClick={handleSubmit}>
                  Submit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Location Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up" style={{ animationDelay: "150ms" }}>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div>
                  <h2 className="font-serif text-2xl mb-2">Location</h2>
                  <p className="text-sm text-muted-foreground">
                    Where are you joining from?
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label-uppercase text-muted-foreground">City Area</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
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
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Local</span>
                      <span>Regional</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Notes Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div>
                  <h2 className="font-serif text-2xl mb-2">Notes</h2>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="E.g., I need wheelchair access, or prefer quiet venues..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground text-right">Optional</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Preferences;
