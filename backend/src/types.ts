export interface Availability {
    [day: string]: {
        am: boolean;
        pm: boolean;
    };
}

export interface Participant {
    userId: string;
    email: string;
    topics: string[];
    availability: Availability;
    location: string;
    travelRadius: number;
}

export interface Option {
    title: string;          // e.g. "Web Dev Workshop"
    description: string;    // e.g. "Focusing on React..."
    day: string;           // "WED"
    time: string;          // "AM" or "PM"
    location: string;      // "Berlin Mitte"
    score: number;         // 0-100
    fairnessScore: number; // 0-100
    attendees: string[];   // list of userIds who can make it
    pros: string[];
    cons: string[];
    avgDistance?: number;
}

export interface Result {
    bestOption: Option;
    alternatives: Option[];
    computedAt: Date;
    fairnessScore: number; // Overall system fairness
    explanation?: string;
    isAiGenerated?: boolean;
    stats?: {
        topics: Record<string, number>;
        availability: Record<string, number>;
        totalParticipants: number;
    };
    totalParticipants?: number;
    isDemoData?: boolean;
}
