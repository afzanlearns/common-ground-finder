import { Participant, Result, Option } from './types';

export function solve(participants: Participant[]): Result {
    if (participants.length === 0) {
        throw new Error("No participants");
    }

    // 1. Calculate Topic Popularity
    const topicCounts: Record<string, number> = {};
    participants.forEach(p => {
        p.topics.forEach(t => {
            topicCounts[t] = (topicCounts[t] || 0) + 1;
        });
    });
    const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
    const topTopic = sortedTopics.length > 0 ? sortedTopics[0][0] : "General Meetup";

    // 2. Calculate Availability Overlap
    // We check every slot (Mon AM, Mon PM, etc.)
    const slots = ["MON", "TUE", "WED", "THU", "FRI"];
    const periods = ["am", "pm"];

    let bestSlot = { day: "MON", period: "pm", count: -1, attendees: [] as string[] };
    const allOptions: Option[] = [];

    slots.forEach(day => {
        periods.forEach(period => {
            const attendees = participants.filter(p =>
                p.availability[day] && p.availability[day][period as "am" | "pm"]
            ).map(p => p.userId);

            const score = Math.round((attendees.length / participants.length) * 100);

            // Simple logic: Location is just the most common location of attendees
            // In a real app, we'd calculate centroid.
            const locCounts: Record<string, number> = {};
            attendees.forEach(uid => {
                const p = participants.find(x => x.userId === uid);
                if (p) locCounts[p.location] = (locCounts[p.location] || 0) + 1;
            });
            const topLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Online";

            const option: Option = {
                title: `${topTopic} Session`,
                description: `A session focused on ${topTopic}, maximizing attendance.`,
                day,
                time: period.toUpperCase(),
                location: topLoc,
                score,
                fairnessScore: 90, // Placeholder for complex fairness math
                attendees,
                pros: [`${attendees.length}/${participants.length} Available`],
                cons: []
            };

            allOptions.push(option);

            if (attendees.length > bestSlot.count) {
                bestSlot = { day, period, count: attendees.length, attendees };
            }
        });
    });

    // Sort options by score
    allOptions.sort((a, b) => b.score - a.score);

    const bestOption = allOptions[0];

    // --- REAL MATH CALCULATIONS ---

    // 1. Calculate weighted Fairness Score
    // Formula: (Availability % * 0.6) + (Topic Interest % * 0.4)
    // We calculate Topic Interest % specifically for the attendees of this slot.
    const calculateFairness = (opt: Option) => {
        const interestedCount = opt.attendees.filter(uid => {
            const p = participants.find(x => x.userId === uid);
            return p?.topics.includes(topTopic);
        }).length;

        const interestScore = opt.attendees.length > 0
            ? (interestedCount / opt.attendees.length) * 100
            : 0;

        return Math.round((opt.score * 0.7) + (interestScore * 0.3));
    };

    // 2. Calculate Distance Heuristic
    // Since we don't have Lat/Lng without Google Maps, we use "Location Consensus"
    // Penalty is based on the number of unique locations among participants.
    const calculateDistance = (opt: Option) => {
        const uniqueLocs = new Set(participants.map(p => p.location.toLowerCase().trim())).size;
        // Basic heuristic: 1.5km per unique location cluster, 
        // reduced if it's the "Top Loc" chosen for the option.
        return Math.max(0.5, uniqueLocs * 1.5);
    };

    // Apply to Best Option
    bestOption.fairnessScore = calculateFairness(bestOption);
    bestOption.avgDistance = calculateDistance(bestOption);

    // MOCK DATA FALLBACK (Per User Request)
    // If we only have 1 participant (usually the owner testing), 
    // inject high-quality mock data so the dashboard looks "full".
    const isMockMode = participants.length <= 1;
    if (isMockMode) {
        bestOption.attendees = [...bestOption.attendees, "mock-1", "mock-2", "mock-3", "mock-4", "mock-5"];
        bestOption.fairnessScore = 94;
        bestOption.avgDistance = 1.2;
        bestOption.pros = ["Maximum overlap found", "High topic alignment"];
    }

    // Filter and update alternatives
    const alternatives = allOptions.slice(1, 4).map((alt, idx) => {
        const fairness = isMockMode ? (85 - (idx * 5)) : calculateFairness(alt);
        const dist = isMockMode ? (2.5 + (idx * 1.2)) : calculateDistance(alt);

        return {
            ...alt,
            fairnessScore: fairness,
            avgDistance: dist,
            title: alt.title.replace("Session", "Plan")
        };
    });

    return {
        bestOption,
        alternatives,
        computedAt: new Date(),
        fairnessScore: bestOption.fairnessScore,
        // explanation and isAiGenerated will be added by gemini.ts
    };
}
