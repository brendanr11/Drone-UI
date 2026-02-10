Drone-UI (Prototype)

Game-inspired touch interface for one-to-many sUAS control (MQP). Focus features: control groups, box/multi-select, alert stack, minimap.

Live Demo

Use in a browser or on a tablet (recommended):
•	Render: https://drone-ui-f63q.onrender.com/

Tip: Add to Home Screen on iPad/Android for a full-screen feel.

Quick Start (Local)
Requirements: Node 18+ and npm.

# from repo root
cd app
npm install
npm run dev

Open the URL printed by Vite (usually http://localhost:5173).

Testing on a tablet on your Wi-Fi? Run npm run dev -- --host and browse to your laptop’s LAN IP (e.g., http://192.168.x.x:5173).

Touch & Basic Use
•	Pan/Zoom: two-finger pan, pinch to zoom.
•	Box/Multi-Select: drag to select multiple items where available.
•	Control Groups (if present): long-press to save a selection; tap a group tab to recall.
•	Alerts (if present): tap an alert to jump to event; use the on-screen control to return.

This is a prototype; some features may be stubs or visuals only.

Build (Static)
cd app
npm run build
# output in app/dist

Serve locally (any static server), for example:
npx serve dist

Deploy on Render (Static Site)

Service type: Static Site
Root directory: app
Build command: npm ci && npm run build
Publish directory: dist

Render will host the compiled Vite app.

Project Links
•	Figma (prototype variants): **add link**
•	User Evaluation Plan (C-Term draft): **add link**
•	Slides / “Novel Gaming UI vs. ATAK”: **add link**
•	GitHub Repo: https://github.com/brendanr11/Drone-UI

Known Notes / Troubleshooting
•	If the page loads but styles look off, ensure Node ≥ 18 and a clean install (rm -rf app/node_modules && npm install).
•	For network testing on device, use --host and confirm your firewall allows local connections.

Acknowledgment

This prototype is part of a WPI MQP collaborating with DEVCOM Soldier Center.