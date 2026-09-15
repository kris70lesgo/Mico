# Mico Mobile-Responsive Experience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Mico comfortable and complete for general learners on a phone without reducing the anatomy lesson or 3D exploration experience to a shrunken desktop page.

**Architecture:** Keep the desktop shell unchanged and add a mobile-only navigation dock plus a final responsive CSS layer. The layer owns small-screen layout, safe-area spacing, touch-target sizing, one-column content flow, and focused lesson behavior so it can safely override earlier desktop-first visual layers.

**Tech Stack:** React, TypeScript, CSS media queries, existing Lucide icons and Mico assets.

---

### Task 1: Add phone navigation

**Files:**
- Modify: `app/mico-app.tsx`
- Modify: `app/mico-mobile.css`

1. Add a compact, fixed bottom dock containing Learn, Practice, Shop, and Profile.
2. Use the existing app view state and icons rather than duplicating route state.
3. Hide the dock during focused lessons, like the existing mobile header.
4. Give each item a 44px-or-larger tap target and preserve active state styling.

### Task 2: Establish a mobile layout layer

**Files:**
- Create: `app/mico-mobile.css`
- Modify: `app/mico-app.tsx`

1. Import the new stylesheet last so it can resolve conflicting legacy desktop rules.
2. At 680px and below, reset negative desktop header spacing, use safe-area insets, constrain card widths, and change layouts/rails to one column.
3. At 420px and below, reduce visual density without making body copy unreadable.
4. Keep desktop styles unchanged above the breakpoint.

### Task 3: Make lessons touch-safe

**Files:**
- Modify: `app/mico-mobile.css`
- Verify: `app/mico-activity-player.css`

1. Keep the progress header visible while the question content scrolls.
2. Stack feedback and action controls, ensure input/options are at least 48px tall, and respect iPhone safe-area padding.
3. Let 3D model cards fill the available width and avoid model controls colliding with the fixed answer action.

### Task 4: Verify

**Files:**
- Test: `app/mico-app.tsx`

1. Run `npm run check`, `npm run build`, and `git diff --check`.
2. Review at narrow phone widths and landscape rules by inspecting the production build.
3. Commit and push the responsive work.
