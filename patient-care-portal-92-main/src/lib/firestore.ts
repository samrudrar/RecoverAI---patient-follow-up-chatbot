import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    Timestamp,
    writeBatch,
    doc,
} from "firebase/firestore";
import { db } from "./firebase";

// ---------- Types ----------

export interface Patient {
    id: string;
    name: string;
    age: number;
    surgery: string;
    date: string;
    status: "good" | "recovering" | "attention";
    pain: number;
    alerts: number;
    lastCheckin: string;
    nextCheckin: string;
    phone: string;
}

export interface Followup {
    id: string;
    date: string;
    pain: number;
    mood: string;
    symptoms: string[];
    notes: string;
    status: "pending" | "reviewed";
    userId: string;
    createdAt?: Timestamp;
}

// ---------- Patients ----------

export const getPatients = async (): Promise<Patient[]> => {
    const snapshot = await getDocs(collection(db, "patients"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Patient));
};

// ---------- Follow-ups ----------

export const getFollowups = async (): Promise<Followup[]> => {
    const q = query(collection(db, "followups"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Followup));
};

export const addFollowup = async (
    data: Omit<Followup, "id">
): Promise<string> => {
    const ref = await addDoc(collection(db, "followups"), {
        ...data,
        createdAt: Timestamp.now(),
    });
    return ref.id;
};

// ---------- Seed Data ----------

const seedPatientsData = [
    {
        name: "Sarah Johnson",
        age: 45,
        surgery: "Knee Replacement",
        date: "2026-02-15",
        status: "recovering",
        pain: 3,
        alerts: 0,
        lastCheckin: "2 hours ago",
        nextCheckin: "Tomorrow 9:00 AM",
        phone: "+1 555-0101",
    },
    {
        name: "Michael Chen",
        age: 62,
        surgery: "Cardiac Bypass",
        date: "2026-02-20",
        status: "attention",
        pain: 7,
        alerts: 2,
        lastCheckin: "30 min ago",
        nextCheckin: "Today 4:00 PM",
        phone: "+1 555-0102",
    },
    {
        name: "Emily Davis",
        age: 38,
        surgery: "Appendectomy",
        date: "2026-02-22",
        status: "good",
        pain: 1,
        alerts: 0,
        lastCheckin: "1 hour ago",
        nextCheckin: "Tomorrow 10:00 AM",
        phone: "+1 555-0103",
    },
    {
        name: "Robert Wilson",
        age: 71,
        surgery: "Hip Replacement",
        date: "2026-02-18",
        status: "recovering",
        pain: 5,
        alerts: 1,
        lastCheckin: "4 hours ago",
        nextCheckin: "Today 6:00 PM",
        phone: "+1 555-0104",
    },
    {
        name: "Lisa Park",
        age: 55,
        surgery: "Spinal Fusion",
        date: "2026-02-25",
        status: "good",
        pain: 2,
        alerts: 0,
        lastCheckin: "15 min ago",
        nextCheckin: "Tomorrow 8:00 AM",
        phone: "+1 555-0105",
    },
];

const seedFollowupsData = [
    {
        date: "2026-02-28",
        pain: 5,
        mood: "Okay",
        symptoms: ["Pain at incision", "Swelling"],
        notes: "Mild discomfort when walking.",
        status: "reviewed",
        userId: "seed",
    },
    {
        date: "2026-02-26",
        pain: 7,
        mood: "Poor",
        symptoms: ["Pain at incision", "Fatigue", "Insomnia"],
        notes: "Had trouble sleeping due to pain.",
        status: "reviewed",
        userId: "seed",
    },
    {
        date: "2026-02-24",
        pain: 4,
        mood: "Good",
        symptoms: ["Swelling"],
        notes: "Feeling better overall. Swelling going down.",
        status: "reviewed",
        userId: "seed",
    },
];

export const seedDatabase = async (): Promise<void> => {
    const batch = writeBatch(db);

    // Seed patients
    for (const patient of seedPatientsData) {
        const ref = doc(collection(db, "patients"));
        batch.set(ref, patient);
    }

    // Seed followups
    for (const followup of seedFollowupsData) {
        const ref = doc(collection(db, "followups"));
        batch.set(ref, { ...followup, createdAt: Timestamp.now() });
    }

    await batch.commit();
};
