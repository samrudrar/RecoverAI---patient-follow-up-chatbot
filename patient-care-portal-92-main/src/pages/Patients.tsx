import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Heart, LogOut, User, Activity, AlertTriangle, CheckCircle2,
  Phone, Calendar, TrendingUp, Clock, MessageCircle, Database, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getPatients, seedDatabase, type Patient } from "@/lib/firestore";
import DarkModeToggle from "@/components/DarkModeToggle";

const statusConfig = {
  good: { label: "Good", className: "bg-accent/15 text-accent border-accent/30" },
  recovering: { label: "Recovering", className: "bg-primary/10 text-primary border-primary/30" },
  attention: { label: "Needs Attention", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

const Patients = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (err) {
        console.error("Error fetching patients:", err);
        toast.error("Failed to load patients from database.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedDatabase();
      const data = await getPatients();
      setPatients(data);
      toast.success("Sample data loaded into Firestore!");
    } catch (err) {
      console.error("Error seeding data:", err);
      toast.error("Failed to seed data.");
    } finally {
      setSeeding(false);
    }
  };

  const stats = [
    { icon: User, label: "Total Patients", value: patients.length, color: "text-primary" },
    { icon: CheckCircle2, label: "Good Recovery", value: patients.filter(p => p.status === "good").length, color: "text-accent" },
    { icon: AlertTriangle, label: "Need Attention", value: patients.filter(p => p.status === "attention").length, color: "text-destructive" },
    { icon: Activity, label: "Avg Pain Level", value: patients.length > 0 ? (patients.reduce((s, p) => s + p.pain, 0) / patients.length).toFixed(1) : "0", color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-medical flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Patient Follow-up</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Dr. {username}</span>
            <DarkModeToggle />
            <Button variant="outline" size="sm" onClick={async () => { await logout(); navigate("/"); }} className="gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Patient Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor post-surgery recovery and automated follow-ups</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-5 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-card rounded-xl shadow-card border border-border p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading patients from Firestore...</p>
          </div>
        )}

        {/* Empty state with Seed button */}
        {!loading && patients.length === 0 && (
          <div className="bg-card rounded-xl shadow-card border border-border p-12 text-center">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-6">
              Your Firestore database is empty. Load sample patient data to get started.
            </p>
            <Button onClick={handleSeedData} disabled={seeding} className="gap-2">
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Seeding...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" /> Load Sample Data
                </>
              )}
            </Button>
          </div>
        )}

        {/* Patients Table */}
        {!loading && patients.length > 0 && (
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Patient Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["Patient", "Surgery", "Date", "Status", "Pain", "Last Check-in", "Next Check-in", "Alerts", "Contact"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const status = statusConfig[patient.status as keyof typeof statusConfig];
                    return (
                      <tr key={patient.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-foreground">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">Age {patient.age}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{patient.surgery}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{patient.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={status?.className}>{status?.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(patient.pain / 10) * 100}%`,
                                  backgroundColor: patient.pain <= 3 ? 'hsl(var(--accent))' : patient.pain <= 6 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground">{patient.pain}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{patient.lastCheckin}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />{patient.nextCheckin}</span>
                        </td>
                        <td className="px-6 py-4">
                          {patient.alerts > 0 ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
                              <Phone className="w-3 h-3" /> {patient.alerts}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(`tel:${patient.phone.replace(/\s/g, '')}`, '_self')}
                              title={`Call ${patient.name}`}
                            >
                              <Phone className="w-3.5 h-3.5 text-primary" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const cleanPhone = patient.phone.replace(/[^0-9]/g, '');
                                const message = encodeURIComponent(
                                  `Hello ${patient.name}, this is Dr. ${username} from the Patient Follow-up team. I'm checking in on your recovery after your ${patient.surgery} on ${patient.date}. How are you feeling today?`
                                );
                                window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
                              }}
                              title={`WhatsApp ${patient.name}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Patients;
