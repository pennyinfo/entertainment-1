## Plan: Neon Splash Screen for "fun-time"

### Overview
Build a dark, neon-glow splash/intro screen for the "fun-time" site. The screen will auto-dismiss after 3 seconds with a smooth transition to the main homepage.

### Design Direction
- **Background**: Deep dark (#0a0a0f) with subtle animated gradient orbs
- **Typography**: "fun-time" in large, glowing neon text (cyan/magenta gradient glow)
- **Effects**: Subtle floating particles, pulsing glow animation on the logo
- **Transition**: Fade-out + scale-up transition to the main page

### Technical Approach
- Build as a self-contained splash component (`src/components/SplashScreen.tsx`)
- Use CSS animations and Tailwind utilities for the neon glow and particle effects
- Splash auto-hides after ~3 seconds via `setTimeout` + local state
- Main page (index) shows underneath; splash overlays with `fixed` positioning
- Update the `src/routes/index.tsx` to include the splash + a simple homepage that reveals after

### Files to Modify / Create
1. `src/components/SplashScreen.tsx` — the splash screen component
2. `src/routes/index.tsx` — wrap with splash + add a simple homepage reveal
3. `src/styles.css` — add custom keyframe animations for glow pulse and particle float

### Acceptance Criteria
- Dark background with neon glow on "fun-time" text
- Subtle particle/light effects in the background
- Auto-dismisses after 3 seconds with smooth fade/scale transition
- Reveals a clean homepage underneath
- Responsive on all screen sizes