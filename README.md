# Drone-UI (Prototype)

Game-inspired touch interface for **one-to-many sUAS control (MQP)**.  
Main prototype features include control groups, box/multi-select, alert stack behavior, and map-based drone tasking. The app also includes separate game-inspired and baseline variants for A/B testing, along with in-app study controls and logging.

---

## Live Demo

Use in a browser or on a tablet (recommended):

- Render: https://drone-ui-f63q.onrender.com/

**Tip:** On iPad/Android, use “Add to Home Screen” for full-screen.

---

## Quick Start (Local)

**Requirements:** Node 18+ and npm.

From the **repo root**, run:

```bash
cd app
npm install
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).
Use on a tablet connected to Wi-Fi

Expose Vite to your local network:
```bash
npm run dev -- --host
```
Then open your laptop’s LAN IP on the tablet, for example: http://192.168.x.x:5173

## Interaction Notes
- Pan / Zoom: two-finger pan; pinch to zoom
- Box / Multi-Select: drag to select multiple items (not in first-person view)
- Control Groups: long-press to save a selection; tap a group tab to recall
- Alerts: tap an alert to jump to event; use on-screen control to return
- Study Controls: Facilitator tools allow condition setup, task control, and export of CSV/JSON logs

Note: This is a prototype. Some features are simplified and are intended for testing rather than full deployment.

## Render Deployment
- Service type: Static Site
- Root directory: app
- Build command: npm ci && npm run build
- Publish directory: dist

Pushes to main will auto-deploy. Use “Clear build cache & deploy” if deps change.

## Tech Stack
- React + Vite
- Tailwind CSS

## Acknowledgment
This prototype is part of a WPI MQP collaboration with DEVCOM Soldier Center.
