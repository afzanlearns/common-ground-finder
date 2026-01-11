import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const JoinGroup = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      toast.error("Please enter a valid code");
      return;
    }

    setIsLoading(true);
    let groupId = inviteCode.trim();

    // Parse input if it's a URL
    if (groupId.includes("groupId=") || groupId.includes("http")) {
      try {
        // Handle both full URLs and partial query strings
        const urlString = groupId.startsWith("http") ? groupId : `http://dummy.com/${groupId}`;
        const url = new URL(urlString);
        groupId = url.searchParams.get("groupId") || groupId;
      } catch (e) {
        // Fallback regex
        const match = groupId.match(/groupId=([^&]+)/);
        if (match) groupId = match[1];
      }
    }

    // Small delay to simulate processing/validation feel
    setTimeout(() => {
      if (groupId) {
        navigate(`/preferences?groupId=${groupId}`);
      } else {
        toast.error("Could not extract a valid group ID");
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="app" />

      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-xl">
          <div className="text-center mb-10 animate-fade-in">
            <div className="w-12 h-0.5 bg-foreground mx-auto mb-6" />
            <h1 className="heading-display text-4xl md:text-5xl mb-3">
              <span className="heading-display-italic">Join</span> Group
            </h1>
            <p className="text-muted-foreground">
              Enter your invite code to start participating.
            </p>
          </div>

          <div className="card-elevated p-8 animate-slide-up">
            <form onSubmit={handleJoin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="inviteCode" className="label-uppercase text-foreground">
                  Invite Code
                </label>
                <Input
                  id="inviteCode"
                  placeholder="e.g. group-xyz-123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="h-11 font-medium bg-background"
                  autoFocus
                />
              </div>
              <Button type="submit" variant="hero" size="xl" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? "Joining..." : "Join Group"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="text-xs text-muted-foreground text-center pt-2">
                Don't have a code? Ask the group creator to share the invite code.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JoinGroup;
