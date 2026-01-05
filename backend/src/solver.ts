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

    // Mock Data Enforcements (as per user request)
    bestOption.fairnessScore = 95;
    bestOption.avgDistance = 1.2;
    // Mock attendees if empty to 12
    if (!bestOption.attendees.length) {
        bestOption.attendees = Array(12).fill("mock-user");
    }

    // Force Location to be user input if available (to support single-user demo flow)
    const userLocation = participants.find(p => p.location && p.location.trim().length > 0)?.location;
    if (userLocation) {
        bestOption.location = userLocation;
    }

    const alternatives = allOptions.slice(1, 4).map((alt, index) => {
        // Enforce distinct mock scores
        const mockScores = [80, 75, 70];
        const mockDistances = [2.5, 3.8, 5.1];

        return {
            ...alt,
            fairnessScore: mockScores[index] || 60,
            avgDistance: mockDistances[index] || 6.5,
            title: alt.title.replace("Session", "Plan") // Rename to "Plan" as requested
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
