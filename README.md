# Blanca Estella Galvan Memorial Website

A fullstack memorial website for Blanca Estella Galvan.

## Features
- Home page with biography, prayer, and family
- Photo gallery — visitors can upload photos
- Memories guestbook — visitors can leave messages that save permanently

## Setup locally
```
npm install
node server.js
```
Visit http://localhost:3000

## Deploy to Render.com
1. Push this repo to GitHub
2. Go to render.com → New Web Service
3. Connect your GitHub repo
4. Set:
   - Language: Node
   - Build command: npm install
   - Start command: node server.js
   - Instance type: Free
5. Click Deploy

## Add Blanca's portrait
Place a file named `blanca-portrait.jpg` inside the `public/` folder.

## File structure
```
blanca-memorial/
├── server.js          — Express backend
├── package.json
├── memories.json      — Saved memories (auto-created)
├── gallery.json       — Gallery index (auto-created)
├── .gitignore
└── public/
    ├── index.html     — Main site
    ├── style.css      — All styles
    ├── app.js         — Frontend JavaScript
    ├── blanca-portrait.jpg  — Add this manually
    └── uploads/       — Guest photo uploads (auto-created)
```
