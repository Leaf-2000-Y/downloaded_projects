# Personal Review Assistant Design

## Goal

Build a local-first AI personal review assistant for entrepreneurs and indie builders. The first version helps a user finish a daily review in 5-8 minutes, check yesterday's promised actions, identify drift from long-term goals, generate tomorrow's 1-3 actions, and save/export review history locally.

## Product Shape

The app is a single working dashboard, not a landing page. First-time users complete a short goal setup with three fields: long-term direction, 1-3 month goal, and daily focus direction. After setup, the main screen shows goal context, daily review input, yesterday action follow-up, latest review card, history, streak, Markdown export, and a lightweight weekly review generator.

## Interaction Model

Daily review uses a fixed template for MVP:

- Long-term goal reminder
- Yesterday action completion check
- Today's key events
- Today's problems or mistakes
- Whether the user advanced the most important goal
- Why drift happened if it happened
- Tomorrow direction

The user submits the form once. The app generates a structured review card with key events, problems, drift status, tomorrow actions, repeated pattern, and personalized positive feedback. The first tomorrow action is marked as the most important action.

## AI Boundary

The first implementation uses a deterministic local coach engine so the product works without accounts, API keys, or a database. The code keeps generation logic isolated so an external model API can replace the local generator later without changing the UI data model.

## Data Model

All data is saved in browser localStorage:

- Goals
- Daily review records
- Tomorrow actions
- Weekly review summaries
- Streak derived from saved review dates

Records are structured as JSON internally. Markdown export is available in the first version; JSON export remains easy to add because saved records are already structured.

## UI Direction

The visual style should feel like a quiet, focused work tool: dense enough for repeated daily use, warm enough for personal growth, and restrained enough to avoid a marketing-page feel. Cards use 8px radii, clear section hierarchy, compact controls, and real app content on the first screen.

## Testing

Playwright covers the critical MVP flow:

1. First-time goal setup
2. Daily review submission
3. Yesterday action tracking on the following review
4. Weekly review generation
5. Markdown export availability

Because the workspace is not a git repository, this design document cannot be committed here.
