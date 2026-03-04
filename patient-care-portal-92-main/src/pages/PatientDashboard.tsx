import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Heart, Send, Plus, Thermometer, Activity,
  Calendar, Clock, CheckCircle2, AlertCircle, Phone, MessageCircle, Loader2,
  Menu, X, LogOut, User, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getFollowups, addFollowup, type Followup } from "@/lib/firestore";
import DarkModeToggle from "@/components/DarkModeToggle";

const symptomOptions = [
  "Pain at incision", "Swelling", "Fever", "Nausea", "Dizziness",
  "Difficulty breathing", "Redness", "Numbness", "Fatigue", "Insomnia",
];

const moods = [
  { label: "Great", emoji: "😊" },
  { label: "Good", emoji: "🙂" },
  { label: "Okay", emoji: "😐" },
  { label: "Poor", emoji: "😟" },
  { label: "Bad", emoji: "😣" },
];

const PatientDashboard = () => {
  const { isAuthenticated, username, user, logout } = useAuth();
  const navigate = useNavigate();

  const [painLevel, setPainLevel] = useState([3]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [notes, setNotes] = useState("");
  const [temperature, setTemperature] = useState("");
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loadingFollowups, setLoadingFollowups] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        const data = await getFollowups();
        setFollowups(data);
      } catch (err) {
        console.error("Error fetching follow-ups:", err);
        toast.error("Failed to load follow-up history.");
      } finally {
        setLoadingFollowups(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error("Please select your current mood.");
      return;
    }
    setSubmitting(true);
    try {
      const newEntry = {
        date: new Date().toISOString().split("T")[0],
        pain: painLevel[0],
        mood: selectedMood,
        symptoms: selectedSymptoms,
        notes: notes.trim(),
        status: "pending" as const,
        userId: user?.uid ?? "anonymous",
      };
      const id = await addFollowup(newEntry);
      setFollowups([{ id, ...newEntry } as Followup, ...followups]);
      setPainLevel([3]);
      setSelectedSymptoms([]);
      setSelectedMood("");
      setNotes("");
      setTemperature("");
      toast.success("Follow-up submitted successfully! Your doctor will review it.");
    } catch (err) {
      console.error("Error submitting follow-up:", err);
      toast.error("Failed to submit follow-up. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const painColor = painLevel[0] <= 3 ? "text-accent" : painLevel[0] <= 6 ? "text-primary" : "text-destructive";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-card border-l border-border shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-border">
            <span className="font-bold text-foreground">Menu</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="px-5 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-medical flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium text-sm">
              <Heart className="w-4 h-4" /> My Recovery
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted text-sm transition-colors"
              onClick={() => { setSidebarOpen(false); }}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={async () => {
                await logout();
                navigate("/");
              }}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-medical flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">My Recovery</span>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Hello, {username} 👋</h1>
          <p className="text-muted-foreground mt-1">How are you feeling today? Submit your daily check-in below.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Follow-up form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-card border border-border p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Daily Follow-up</h2>
              </div>

              {/* Mood */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium">How are you feeling?</Label>
                <div className="flex gap-2 flex-wrap">
                  {moods.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setSelectedMood(m.label)}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${selectedMood === m.label
                        ? "bg-primary text-primary-foreground border-primary shadow-medical"
                        : "bg-card text-foreground border-border hover:border-primary/40"
                        }`}
                    >
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pain Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Pain Level</Label>
                  <span className={`text-2xl font-bold ${painColor}`}>{painLevel[0]}/10</span>
                </div>
                <Slider
                  value={painLevel}
                  onValueChange={setPainLevel}
                  max={10}
                  min={0}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>No pain</span><span>Moderate</span><span>Severe</span>
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-muted-foreground" /> Temperature (°F) — optional
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 98.6"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="h-11 bg-background"
                />
              </div>

              {/* Symptoms */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium">Symptoms (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${selectedSymptoms.includes(s)
                        ? "bg-secondary text-secondary-foreground border-primary/40 font-medium"
                        : "bg-card text-muted-foreground border-border hover:border-primary/30"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Additional Notes</Label>
                <Textarea
                  placeholder="Describe how you're feeling, any concerns, or questions for your doctor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] bg-background resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{notes.length}/500</p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-medical gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Follow-up
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl shadow-card border border-border p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" /> Recovery Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/60 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-xs text-muted-foreground">Days Post-Op</p>
                </div>
                <div className="bg-secondary/60 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-accent">{followups.length}</p>
                  <p className="text-xs text-muted-foreground">Check-ins</p>
                </div>
              </div>
            </div>

            {/* Contact Doctor */}
            <div className="bg-card rounded-xl shadow-card border border-border p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-primary" /> Contact Your Doctor
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Dr. Smith — Surgeon</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => window.open('tel:+15550199', '_self')}
                >
                  <Phone className="w-4 h-4 text-primary" /> Call Doctor
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => window.open('https://wa.me/14155238886?text=join%20some-at', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp Doctor
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card border border-border p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-primary" /> Past Follow-ups
              </h3>

              {loadingFollowups && (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              )}

              {!loadingFollowups && followups.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No follow-ups yet. Submit your first check-in!
                </p>
              )}

              <div className="space-y-3">
                {followups.map((f) => (
                  <div key={f.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {f.date}
                      </span>
                      <Badge
                        variant="outline"
                        className={f.status === "reviewed"
                          ? "bg-accent/15 text-accent border-accent/30"
                          : "bg-primary/10 text-primary border-primary/30"
                        }
                      >
                        {f.status === "reviewed" ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Reviewed</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>Pain: <strong className="text-foreground">{f.pain}/10</strong></span>
                      <span>Mood: <strong className="text-foreground">{f.mood}</strong></span>
                    </div>
                    {f.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {f.symptoms.map((s) => (
                          <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    )}
                    {f.notes && <p className="text-sm text-muted-foreground">{f.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
