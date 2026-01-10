import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/layout/Header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { InterestChip } from "@/components/preferences/InterestChip";
import { AvailabilityGrid, TimeRangeSlot } from "@/components/preferences/AvailabilityGrid";
import { ArrowRight, Plus, X, Info } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


// Removed hardcoded TOPICS

const Preferences = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");
  const [groupTitle, setGroupTitle] = useState("Loading...");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [availableSubtopics, setAvailableSubtopics] = useState<{ text: string, original: boolean }[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  // New Availability State (Time Ranges)
  const [availability, setAvailability] = useState<Record<string, TimeRangeSlot>>({
    MON: { selected: false, from: "09:00", to: "17:00" },
    TUE: { selected: false, from: "09:00", to: "17:00" },
    WED: { selected: false, from: "09:00", to: "17:00" },
    THU: { selected: false, from: "09:00", to: "17:00" },
    FRI: { selected: false, from: "09:00", to: "17:00" },
    SAT: { selected: false, from: "09:00", to: "17:00" },
    SUN: { selected: false, from: "09:00", to: "17:00" },
  });

  // Meeting Mode
  const [meetingMode, setMeetingMode] = useState<"online" | "offline" | "flexible">("flexible");

  // Location Fields
  const [city, setCity] = useState("");
  const [timezone, setTimezone] = useState("");
  const [travelRadius, setTravelRadius] = useState([15]);
  const [notes, setNotes] = useState("");

  // Creator subtopic editing
  const [newSubtopic, setNewSubtopic] = useState("");

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
          const data = snap.data();
          setGroupTitle(data.title);
          setDescription(data.description || "");
          setDomain(data.domain || "General");
          setAvailableSubtopics(data.subtopics || []);

          if (auth.currentUser && data.createdBy === auth.currentUser.uid) {
            setIsCreator(true);
          }
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

  const handleAvailabilityChange = (day: string, field: keyof TimeRangeSlot, value: any) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleBulkAvailabilityChange = (newAvailability: Record<string, TimeRangeSlot>) => {
    setAvailability((prev) => ({
      ...prev,
      ...newAvailability
    }));
  };

  // Creator & Participant Actions
  const handleAddSubtopic = async () => {
    if (!newSubtopic.trim() || !groupId) return;
    const topicToAdd = newSubtopic.trim();
    if (availableSubtopics.some(t => t.text === topicToAdd)) return;

    try {
      const newItem = { text: topicToAdd, original: false };
      const updatedList = [...availableSubtopics, newItem];

      await updateDoc(doc(db, "groups", groupId), {
        subtopics: updatedList
      });
      setAvailableSubtopics(updatedList);
      setNewSubtopic("");
      toast.success("Option added");
    } catch (e) {
      toast.error("Failed to add option");
    }
  };

  const handleRemoveSubtopic = async (topicText: string) => {
    if (!groupId) return;
    try {
      const updatedList = availableSubtopics.filter(t => t.text !== topicText);
      await updateDoc(doc(db, "groups", groupId), {
        subtopics: updatedList
      });
      setAvailableSubtopics(updatedList);
      // Also remove from selection if present
      setSelectedTopics(prev => prev.filter(t => t !== topicText));
      toast.success("Option removed");
    } catch (e) {
      toast.error("Failed to remove option");
    }
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
      // Process availability for backend
      // We'll store the raw availability object properly or convert it if needed.
      // For now, let's store the raw 'availability' object as it contains clean structure with from/to

      const activeDays = Object.entries(availability)
        .filter(([_, slot]) => slot.selected)
        .map(([day]) => day);

      await setDoc(doc(db, "groups", groupId, "participants", auth.currentUser.uid), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        topics: selectedTopics,
        meetingMode: meetingMode,
        location: city,
        timezone: timezone,
        travelRadius: meetingMode === "online" ? 0 : travelRadius[0],
        availability: availability, // Storing full object with times
        activeDays: activeDays,
        notes: notes,
        updatedAt: new Date()
      });

      // TRIGGER BACKEND CALCULATION
      // We ping the Vercel backend to calculate the result for this group.
      const BACKEND_URL = 'https://common-ground-finder-pa54.vercel.app/';
      fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId })
      }).catch(err => console.error("Failed to trigger backend:", err));

      toast.success("Your preferences have been recorded. Calculating best plan...");
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
            <h1 className="heading-display text-4xl md:text-5xl mb-2">
              {groupTitle}
            </h1>
            {description && (
              <p className="text-muted-foreground text-lg mb-4 max-w-2xl">{description}</p>
            )}

            <div className="flex items-center gap-3 mb-6">
              {isCreator ? (
                <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-medium text-primary">
                  You are the group creator
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground">
                  Participating as a Member
                </span>
              )}
            </div>

            <div className="h-px bg-border/50 w-full mb-6" />

            <h2 className="font-serif text-2xl text-foreground/80 mb-1">
              Preferences for <span className="text-primary">{domain}</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Your inputs will help calculate the optimal plan.
            </p>
          </div>

          <div className="space-y-6">
            {/* Interests Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up relative">
              <span className="absolute top-3 right-6 text-[10px] italic text-primary">Required</span>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="font-serif text-2xl mb-0">Preferences for {domain}</h2>
                  <p className="text-sm text-muted-foreground">
                    Select the topics you’re willing to participate in. Adding fewer improves alignment.
                  </p>
                </div>
                <div>
                  <div className="flex flex-wrap gap-3">
                    {availableSubtopics.map(({ text, original }) => (
                      <div key={text} className="relative group">
                        <div className="flex flex-col gap-1">
                          <InterestChip
                            label={text}
                            selected={selectedTopics.includes(text)}
                            onClick={() => toggleTopic(text)}
                            className={isCreator ? "pr-9" : ""} // Make room for remove button if only creator
                          />
                          {!original && (
                            <span className="text-[10px] text-primary/70 px-1 italic font-medium">
                              *Added by participant
                            </span>
                          )}
                        </div>
                        {isCreator && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveSubtopic(text); }}
                            className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive flex items-center justify-center transition-colors z-10"
                            title="Remove option"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t border-border/50 max-w-md">
                    <Input
                      placeholder="Add another option..."
                      value={newSubtopic}
                      onChange={(e) => setNewSubtopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtopic()}
                      className="h-9 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={handleAddSubtopic} className="shrink-0 gap-1 h-9">
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                  {!isCreator && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Can't find your option? Add it above. It will be marked as a participant contribution.
                    </p>
                  )}
                  {availableSubtopics.length === 0 && (
                    <p className="text-sm text-muted-foreground italic mt-2">No options defined yet.</p>
                  )}
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
                    Select your free time ranges.
                  </p>
                  <p className="text-xs text-muted-foreground/80 italic mt-1">
                    Broader availability improves fairness and match quality.
                  </p>
                </div>
                <AvailabilityGrid
                  availability={availability}
                  onChange={handleAvailabilityChange}
                  onBulkChange={handleBulkAvailabilityChange}
                />
              </div>
            </section>

            {/* Meeting Mode & Location Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up relative" style={{ animationDelay: "150ms" }}>
              <span className="absolute top-3 right-6 text-[10px] italic text-primary">Required</span>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="font-serif text-2xl mb-0">Meeting Mode</h2>
                  <p className="text-sm text-muted-foreground">
                    How should we meet?
                  </p>
                  <p className="text-[10px] text-primary/80 italic mt-1 leading-tight max-w-[180px]">
                    "Flexible" allows the system to propose the best mode.
                  </p>
                </div>

                <div className="space-y-6">
                  <RadioGroup value={meetingMode} onValueChange={(v: any) => setMeetingMode(v)} className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="mode-online" />
                      <Label htmlFor="mode-online">Online</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offline" id="mode-offline" />
                      <Label htmlFor="mode-offline">Offline</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flexible" id="mode-flexible" />
                      <Label htmlFor="mode-flexible">Flexible</Label>
                    </div>
                  </RadioGroup>

                  <div className="pt-4 border-t border-border/50 grid md:grid-cols-2 gap-6">
                    {meetingMode === "online" ? (
                      <>
                        <div className="space-y-2">
                          <label className="label-uppercase text-muted-foreground">City</label>
                          <Input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. London"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="label-uppercase text-muted-foreground">Timezone</label>
                          <Input
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            placeholder="e.g. GMT+0"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <label className="label-uppercase text-muted-foreground">City / Area</label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Downtown, New York"
                        />
                      </div>
                    )}

                    {meetingMode !== "online" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="label-uppercase text-muted-foreground">Max Travel Distance</label>
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
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {meetingMode === "online"
                      ? "Your location helps us find a time that works for everyone's timezones."
                      : "This helps minimize total travel distance for the group."}
                  </p>
                </div>
              </div>
            </section>

            {/* Notes Section */}
            <section className="card-elevated p-6 md:p-8 animate-slide-up relative" style={{ animationDelay: "200ms" }}>
              <span className="absolute top-3 right-6 text-[10px] italic text-muted-foreground">Optional</span>
              <div className="grid md:grid-cols-[200px_1fr] gap-6">
                <div className="flex flex-col items-start gap-1">
                  <h2 className="font-serif text-2xl mb-0">Constraints & Additional Context</h2>
                  <p className="text-sm text-muted-foreground">
                    Constraints are respected by the system but never outweigh group consensus.
                  </p>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="E.g., Wheelchair access required, Prefer online-only, Cannot travel after 7 PM..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </section>

            {/* Submit Bar */}
            <div className="card-elevated p-4 flex flex-wrap items-center justify-end gap-4 animate-slide-up">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" disabled={isLoading}>Save Draft</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You can return before the decision is finalized</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="hero" className="gap-2" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Contribute to Group Decision"}
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
