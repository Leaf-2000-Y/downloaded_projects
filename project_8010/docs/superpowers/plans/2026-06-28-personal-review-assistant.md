# Personal Review Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the starter idea form with a local-first personal review assistant MVP based on the provided SPEC.

**Architecture:** Keep generation and persistence logic separate from the React screen. `app/page.tsx` owns UI state and orchestration, `app/review-engine.ts` owns review-card and weekly-summary generation, and browser localStorage stores structured records.

**Tech Stack:** Next.js App Router, TypeScript, React, CSS, Playwright.

---

## File Structure

- Modify: `app/page.tsx` for the interactive dashboard.
- Modify: `app/globals.css` for the focused work-tool UI.
- Modify: `app/layout.tsx` for product metadata.
- Create: `app/review-engine.ts` for types and deterministic coach logic.
- Modify: `tests/idea-form.spec.ts` into the MVP e2e test.

### Task 1: MVP Flow Test

**Files:**
- Modify: `tests/idea-form.spec.ts`

- [ ] **Step 1: Write the failing test**

Replace the old starter test with a Playwright flow that verifies goal setup, daily review generation, yesterday action tracking, weekly review, and Markdown export controls.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`

Expected: FAIL because the current app only has the starter idea form.

### Task 2: Review Engine

**Files:**
- Create: `app/review-engine.ts`

- [ ] **Step 1: Define structured types**

Add `Goals`, `TomorrowAction`, `DailyReviewRecord`, `WeeklyReview`, and `DailyReviewInput` types.

- [ ] **Step 2: Implement local coach generation**

Add `generateDailyReview`, `generateWeeklyReview`, `buildMarkdownExport`, `calculateStreak`, and small helper functions for splitting text and producing specific actions.

- [ ] **Step 3: Keep behavior deterministic**

Use the user's input, saved goals, yesterday completion state, and previous records to produce predictable review cards suitable for e2e tests.

### Task 3: Dashboard UI

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add first-time goal setup**

Show goal fields when no goals exist in localStorage. Save goals and reveal the review dashboard.

- [ ] **Step 2: Add daily review form**

Render yesterday action checkboxes when previous actions exist. Capture fixed-template answers and submit them to `generateDailyReview`.

- [ ] **Step 3: Render structured review card**

Show key events, mistakes, drift status, repeated pattern, personalized feedback, and tomorrow's 1-3 prioritized actions.

- [ ] **Step 4: Add history, streak, weekly review, and Markdown export**

Show recent review history, derive streak from records, generate a lightweight weekly summary, and trigger a Markdown download.

### Task 4: Verification

**Files:**
- All changed files

- [ ] **Step 1: Run e2e tests**

Run: `npm run test:e2e`

Expected: all Playwright tests pass on desktop and mobile projects.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: Next.js build exits with code 0.

- [ ] **Step 3: Start local dev server**

Run: `npm run dev`

Expected: app is available on `http://127.0.0.1:3000` or the next open port.

## Self-Review

- Spec coverage: the plan covers goal setup, daily review, yesterday tracking, daily card, tomorrow actions, local history, Markdown export, streak, positive feedback, and weekly review.
- Deliberate deferral: external model API is represented as an isolated generation boundary in this pass; the working app uses local deterministic generation so it runs without secrets.
- Placeholder scan: no TBD/TODO placeholders remain.
- Scope check: one single-page MVP, appropriate for one implementation pass.
