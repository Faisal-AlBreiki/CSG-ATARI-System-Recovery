# CSG // ATARI System Recovery

Interactive live event experience built for the **CSG // ATARI Identity Reveal Segment for the Opening Event of the Computer Science Group at Sultan Qaboos University, 2026**.

The project transforms a traditional identity reveal segment into an immersive digital experience where the audience participates using their mobile devices and helps restore a failed central system displayed on the main stage screen.

---

# 🌐 Live Demo

🎮 **Audience Mobile Experience**

Participants use this page to submit puzzle answers and help recover the system:

https://atari-system-recovery.vercel.app/


🖥️ **Stage Screen Experience**

The main cinematic fullscreen experience displayed during the identity reveal:

https://atari-system-recovery.vercel.app/screen

---

# 💡 Project Idea

**CSG // ATARI System Recovery** is an interactive live event experience created for the identity reveal segment of the opening event of the **Computer Science Group (CSG) at Sultan Qaboos University**.

The goal was to transform the audience from passive viewers into active participants inside a digital story.

Instead of revealing the event identity traditionally, the experience introduces a fictional system failure that requires the audience's participation to restore the system.

The experience starts with:

```
SYSTEM FAILURE
```

The central system has collapsed, and the audience must help restore it.

During the event, participants receive puzzle cards. Each puzzle represents a hidden fragment required to recover the final system identity.

The three system fragments are:

```
Fragment 01 → CSG
Fragment 02 → ATARI
Fragment 03 → 2026
```

Participants solve the puzzles using their mobile devices. Every correct answer contributes to restoring the corresponding fragment.

The stage screen receives live updates and visually reacts as fragments are recovered.

After all fragments are restored, the system completes the final recovery sequence:

```
ALL FRAGMENTS RECOVERED

VERIFYING SYSTEM...

SYSTEM RESTORED

CSG - ATARI - 2026
```

---

# 🎬 Experience Flow

## Phase 1 — SYSTEM FAILURE

The stage begins with a cinematic system breakdown.

The audience sees:

```
SYSTEM FAILURE
```

The system enters recovery mode and requests audience interaction.

---

## Phase 2 — Fragment Recovery

Participants access the mobile experience and submit their puzzle answers.

The stage screen displays the recovery progress:

```
FRAGMENT 01
FRAGMENT 02
FRAGMENT 03
```

Each completed fragment unlocks part of the final identity.

---

## Phase 3 — System Restoration

When all required fragments are recovered, the system begins verification:

```
ALL FRAGMENTS RECOVERED

VERIFYING SYSTEM...
```

A cinematic restoration sequence starts.

The final identity is revealed:

```
SYSTEM RESTORED

CSG - ATARI - 2026
```

---

# ✨ Features

- Interactive audience participation
- Mobile-based puzzle submission
- Live fragment recovery system
- Real-time progress updates
- Cinematic fullscreen stage experience
- 16:9 event screen optimization
- Glitch and CRT-inspired visuals
- Background music and system sound effects
- Intro and outro cinematic sequences
- Database-driven progress tracking
- Multi-device participant handling

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- TypeScript
- React
- CSS Animations


## Backend

- Supabase
- PostgreSQL
- RPC Functions


## Deployment

- Vercel

---

# 📂 Project Structure

```
app/
│
├── page.tsx
│   └── Audience mobile experience
│
├── screen/
│   └── page.tsx
│       └── Main stage screen experience
│

public/
│
├── audio/
│   └── Background music and system effects
│
├── video/
│   └── Cinematic intro and outro sequences
│

supabase/
│
└── schema.sql
    └── Database structure and functions
```

---

# ⚙️ How To Run Locally

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/CSG-ATARI-System-Recovery.git
```

Move into the project folder:

```bash
cd CSG-ATARI-System-Recovery
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create:

```
.env.local
```

Add your Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

---

## 4. Run Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

# 🚀 Deployment

The project is deployed using Vercel.

The deployment contains two main experiences:

## Audience Experience

```
/
```

A mobile interface where participants submit answers and contribute to system recovery.

---

## Stage Experience

```
/screen
```

A fullscreen cinematic experience designed for a 16:9 event display.

---

# 🗄️ Database

The project uses Supabase to manage participant submissions.

The database stores:

- Fragment number
- Participant ID
- Submission timestamp

The system prevents the same participant from successfully submitting the same fragment multiple times.

---

# 🔒 Environment & Security

Sensitive configuration files are not included in the repository.

Environment variables should be stored using:

- `.env.local` for local development
- Vercel Environment Variables for production deployment

---

# 📌 Project Purpose

This project combines:

- Software Engineering
- Interactive Web Development
- Event Technology
- Visual Design
- Live Audience Engagement

The goal was to create a memorable **identity reveal experience** where technology becomes part of the story.

---

# 👥 Credits

## Designed & Developed by

**Faisal Al Breiki**  
**Juhaina Al Subhi**


## Created for

**CSG // ATARI Identity Reveal Segment**  
**Opening Event of the Computer Science Group (CSG)**  
**Sultan Qaboos University — 2026**