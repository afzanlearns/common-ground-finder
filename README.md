# Social Common-Ground Finder

Social Common-Ground Finder is a decision-support web application designed to help groups reach fair, transparent, and explainable decisions when multiple people have different preferences.

Instead of relying on informal discussions, polls, or organizer intuition, the system creates a structured decision space where preferences are collected privately, balanced logically, and presented with clear reasoning.

The product is built with communities like Google Developer Groups (GDG), college clubs, student teams, and organizing committees in mind.

---

## Problem Statement

Group decision-making often breaks down when:
- Many participants have different interests and schedules
- Simple voting leads to unfair or impractical outcomes
- Availability conflicts are ignored
- Loud voices dominate discussions
- There is no clarity on why a decision was made

Common tools like chat groups and quick polls do not provide fairness, transparency, or explainability.

---

## Solution Overview

Social Common-Ground Finder replaces voting with balancing.

The system:
- Collects preferences independently from each participant
- Treats all inputs equally
- Balances interests, availability, and constraints
- Produces explainable outcomes instead of hidden logic
- Helps groups reach agreement they can trust

The system does not make decisions for people.  
It helps groups understand trade-offs and arrive at consensus.

---

## Core Concepts

### Decision Space
A private, scoped environment where a group decides on a plan together.

### Invite-Only Participation
Groups are accessed only via invite links. There is no public discovery, search, or open joining.

### Preference Balancing
Preferences are collected without ranking or voting and later balanced to find overlap and fairness.

### Explainability
Every recommended outcome includes a clear explanation of why it was suggested.

---

## User Roles

### Admin (Group Creator)
- Creates a planning group
- Defines the decision context
- Shares the invite link
- Can finalize the decision

Admins cannot:
- See individual preferences
- Edit or delete participant submissions
- Override or bias results

### Participant
- Joins via an invite link
- Submits preferences privately
- Has equal weight in the decision process

There is no hierarchy among participants.

---

## Application Flow

### 1. Landing Page
The landing page presents two clear actions:
- Create a Planning Group
- Join with a Link

These actions communicate intent, not logic.

---

### 2. Create Planning Group
The group creator defines:
- Group name
- Description (decision context)

This step creates a decision space but does not generate outcomes.

---

### 3. Invite Link
After group creation, the system generates a unique invite link.

This link:
- Is the only way to join the group
- Encodes the group context
- Is shared externally (e.g., WhatsApp, Discord, email)

There is no invite code input because the link itself is the access mechanism.

---

### 4. Preference Collection
Participants submit preferences through a guided flow:
- Interests (no ranking or voting)
- Availability (multiple time slots allowed)
- Optional constraints or notes

Participants cannot see others’ inputs, preventing bias.

---

### 5. Results Dashboard
Once enough data is available, the system generates:
- A recommended plan
- Fairness score
- Estimated attendance
- Alternative scenarios
- Plain-language explanation

Results are constructed from inputs, not fetched from external sources.

---

### 6. AI-Assisted Explanation
The system uses AI to generate explanations for outcomes.

AI:
- Does not decide results
- Does not alter scores
- Only explains existing logic clearly

All AI usage is explicitly labeled as AI-assisted.

---

### 7. Confirmation
When the group agrees, the admin finalizes the decision.

The confirmation step:
- Marks the decision as complete
- Prevents further changes
- Represents closure, not execution

---


## Tech Stack (High Level)

- Frontend: Modern web stack (React-based)
- Backend: Node.js
- Authentication: Firebase
- AI: Gemini (for explanation only)
- Hosting: Vercel
- Firestore 

---

## Why This Project Matters

Social Common-Ground Finder focuses on a real, recurring problem: group decision fatigue and unfair outcomes.

By prioritizing fairness, privacy, and explainability, the project demonstrates how technology can support better collaboration rather than replace human judgment.

---

## One-Sentence Summary

Social Common-Ground Finder helps groups reach fair, transparent decisions by balancing preferences and clearly explaining outcomes, instead of relying on biased polls or informal discussions.
