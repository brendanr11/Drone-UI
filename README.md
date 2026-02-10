# Drone-UI (Prototype)

Game-inspired touch interface for **one-to-many sUAS control (MQP)**.  
Focus features: control groups, box/multi-select, alert stack, minimap.

---

## Live Demo

Use in a browser or on a tablet (recommended):

- Render: https://drone-ui-f63q.onrender.com/

**Tip:** On iPad/Android, “Add to Home Screen” for a full-screen feel.

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
Test on a tablet over Wi-Fi

Expose Vite to your LAN:
```bash
npm run dev -- --host
```
Then browse to your laptop’s LAN IP from the tablet, e.g. http://192.168.x.x:5173.

## Touch & Basic Use
- Pan / Zoom: two-finger pan; pinch to zoom
- Box / Multi-Select: drag to select multiple items (where available)
- Control Groups (if present): long-press to save a selection; tap a group tab to recall
- Alerts (if present): tap an alert to jump to event; use on-screen control to return
- Minimap (if present): quick spatial awareness and event panning

Note: This is a prototype; some features may be stubs or visuals only.

## Deploy on Render (Static Site)
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