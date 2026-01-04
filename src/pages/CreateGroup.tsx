import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/Header";
import { Copy, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = "https://common-ground.app/join/Q3-DevFest-2024";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreated(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="app" />

      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-xl">
          <div className="text-center mb-10 animate-fade-in">
            <div className="w-12 h-0.5 bg-foreground mx-auto mb-6" />
            <h1 className="heading-display text-4xl md:text-5xl mb-3">
              <span className="heading-display-italic">Create</span> Group
            </h1>
            <p className="text-muted-foreground">
              Configure a new collaborative space for your team's decision making.
            </p>
          </div>

          <div className="card-elevated p-8 animate-slide-up">
            {!isCreated ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="label-uppercase text-foreground">
                    Group Name
                  </label>
                  <Input
                    placeholder="e.g., Q3 Planning Session"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="label-uppercase text-foreground">
                      Description
                    </label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <Textarea
                    placeholder="Briefly describe the goals and context..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <Button type="submit" variant="hero" size="xl" className="w-full gap-2">
                  Create Group
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl mb-2">Group Created!</h2>
                  <p className="text-muted-foreground text-sm">
                    Share this link with your team to collect preferences.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="label-uppercase text-muted-foreground">
                    Invite Link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="bg-muted/50 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <Button variant="hero" size="lg" className="w-full gap-2" asChild>
                    <Link to="/preferences">
                      Add Your Preferences
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="w-full" asChild>
                    <Link to="/results">
                      View Results Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateGroup;
