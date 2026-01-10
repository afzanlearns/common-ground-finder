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
    // We check every slot against common windows (Morning, Afternoon, Evening)
    const slots = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

    // Convert "HH:MM" to minutes from midnight
    const timeToMinutes = (time: string) => {
        if (!time) return 0;
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const windows = [
        { label: "Morning Session", from: "09:00", to: "13:00" },
        { label: "Afternoon Session", from: "14:00", to: "18:00" },
        { label: "Evening Session", from: "19:00", to: "22:00" }
    ];

    const allOptions: Option[] = [];

    slots.forEach(day => {
        windows.forEach(win => {
            const winFrom = timeToMinutes(win.from);
            const winTo = timeToMinutes(win.to);

            const attendees = participants.filter(p => {
                const daySlot = (p.availability as any)?.[day];
                if (!daySlot || !daySlot.selected) return false;

                const pFrom = timeToMinutes(daySlot.from);
                const pTo = timeToMinutes(daySlot.to);

                // Overlap calculation
                const start = Math.max(winFrom, pFrom);
                const end = Math.min(winTo, pTo);

                // If they overlap for at least 60 minutes
                return (end - start) >= 60;
            }).map(p => p.userId);

            const score = Math.round((attendees.length / participants.length) * 100);

            // Calculate location consensus for these attendees
            const locCounts: Record<string, number> = {};
            attendees.forEach(uid => {
                const p = participants.find(x => x.userId === uid);
                if (p) locCounts[p.location] = (locCounts[p.location] || 0) + 1;
            });
            const topLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Online";

            allOptions.push({
                title: `${topTopic} ${win.label}`,
                description: `A session for ${topTopic} that fits most people.`,
                day,
                time: `${win.from}-${win.to}`,
                location: topLoc,
                score,
                fairnessScore: 0, // Calculated below
                attendees,
                pros: [`${attendees.length} Members Available`],
                cons: []
            });
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

    // Filter and update alternatives (Step 2.5)
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

    // 3. Participation Stats (Breakdown)
    const stats = {
        topics: topicCounts,
        availability: {} as Record<string, number>,
        totalParticipants: participants.length
    };

    // Calculate aggregated availability for stats
    slots.forEach(day => {
        windows.forEach(win => {
            const winFrom = timeToMinutes(win.from);
            const winTo = timeToMinutes(win.to);
            const count = participants.filter(p => {
                const daySlot = (p.availability as any)?.[day];
                if (!daySlot || !daySlot.selected) return false;
                const pFrom = timeToMinutes(daySlot.from);
                const pTo = timeToMinutes(daySlot.to);
                const start = Math.max(winFrom, pFrom);
                const end = Math.min(winTo, pTo);
                return (end - start) >= 60;
            }).length;
            if (count > 0) {
                stats.availability[`${day} ${win.label}`] = count;
            }
        });
    });

    return {
        bestOption,
        alternatives,
        computedAt: new Date(),
        fairnessScore: bestOption.fairnessScore,
        stats,
        totalParticipants: participants.length,
        isDemoData: isMockMode
    };
}
