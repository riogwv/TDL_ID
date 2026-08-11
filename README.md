<div align="center">

<<<<<<< HEAD
# Flow

**Tasks, Calendar & Notes — simple, fast & all in one place.**

No installs. No subscriptions. Just open and go.

[**Open Flow →**](https://riogwv.github.io/TDL_ID/)
=======
# 🌊 Flow

### *Tasks, Calendar & Notes — Simple, Fast & All-in-One.*

No installs. No subscriptions. Just open and go.

[![Live Demo](https://img.shields.io/badge/🚀_Open_App-Flow-4F46E5?style=for-the-badge)](https://riogwv.github.io/TDL_ID/)
>>>>>>> 6271f323ec3771ab10f41f6d466ee699ceeabf09

---

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
<<<<<<< HEAD
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
=======
>>>>>>> 6271f323ec3771ab10f41f6d466ee699ceeabf09
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat-square&logo=github&logoColor=white)

</div>

---

<<<<<<< HEAD
## What is Flow?

Flow is a personal productivity app that lives entirely in your browser. It brings together tasks, a calendar, and rich notes without scattering them across multiple apps.

Sign in with Google or email to sync your data across devices via Firestore. Or skip sign-in and use **Demo Mode**, which stores everything locally in your browser with sample data pre-loaded.

---

## Features

### Tasks & Organization

Create tasks with a title, description, due date, due time, and priority (P1–P4). Organize them into **Projects** and tag them with **Labels** — both color-coded and listed in the sidebar. Each task supports **subtasks** that you can check off individually from the task detail panel.

Set a task to repeat **daily, weekly, monthly, or on weekdays**; completing a recurring task automatically reschedules it to its next occurrence.

Tasks are sorted across focused views:

| View | What it shows |
|---|---|
| **Inbox** | Tasks with no project and no due date |
| **Today** | Tasks due today |
| **Upcoming** | Future tasks grouped by date (up to 14 days) |
| **Overdue** | Past-due incomplete tasks |
| **Completed** | The last 50 completed tasks |
| **Someday** | Tasks with no due date, regardless of project |

### Search & Filtering

The global search bar (`Ctrl/Cmd + K`) supports plain text and filter tokens:

| Token | Effect |
|---|---|
| `p:1` – `p:4` | Filter by priority |
| `#labelname` | Filter by label |
| `@projectname` | Filter by project |
| `done:yes` / `done:no` | Filter by completion status |

Tokens can be combined: `p:1 @work #urgent` returns P1 tasks in the Work project tagged urgent.

### Calendar

Four layouts: **Month**, **Week**, **Day**, and **Agenda**. Click any event to open the task detail panel; click an empty cell to create a task pre-filled with that date and time.

### Notes

A sidebar panel lists all notes sorted by last edit with a search field. Open any note in a rich-text editor supporting **bold, italic, underline, headings (H1–H3), bulleted lists, ordered lists, code blocks, links, and checklists**.

Notes save automatically as you type (1-second debounce). The latest content is also force-saved when:
- You click away from the editor (blur event)
- You switch to a different note

#### Notes Export

Click **⬇ MD** in the note toolbar to download the current note as a `.md` (Markdown) file. Headings, bold, italic, lists, code blocks, and links are converted to standard Markdown.

### Dashboard

Lightweight stats showing tasks completed today vs. your configurable daily goal, a 7-day bar chart, and totals for active tasks, projects, and notes.

### Pomodoro Timer

A built-in focus timer with customizable durations. Click **⚙ Settings** inside the Pomodoro widget to configure:

- **Focus duration** (default 25 min, range 1–120)
- **Short break** (default 5 min, range 1–60)
- **Long break** (default 15 min, range 1–120)
- **Sound alert** — a short beep via the Web Audio API (toggle on/off)

Click **Apply & Reset** to save and restart the timer with the new durations. Preferences persist across sessions in Demo Mode. The timer shows a browser notification when a session ends (permission requested on first Start).

### Data Export & Import

From **Settings → Data**:

- **Export JSON** — downloads a `flow-backup-YYYY-MM-DD.json` file with all tasks, projects, labels, notes, and settings.
- **Import JSON** — upload a previously exported file. A confirmation dialog warns before overwriting existing data.

### Appearance & Settings

- Light / Dark mode — toggle in Settings or press `D`
- Accent color — preset palette in Settings
- Compact mode — tighter task list spacing
- Collapsible sidebar — menu icon or `Ctrl/Cmd + B`
- Focus mode — hides sidebar; press `F`
- Task sort order, daily goal, date format, time format

### Profile

Edit your display name, bio (up to 200 characters), and avatar. Paste an image URL or upload a photo. In Demo Mode, uploaded photos are resized to 200×200 px and compressed before being stored as Base64 in localStorage (keeping storage use small).

---

## PWA / Installable

Flow includes a Web App Manifest and Service Worker. You can install it to your home screen from Chrome, Edge, or Safari on any device. Once installed:

- The app shell (HTML, CSS, JS) loads from cache so the UI appears instantly even on slow connections.
- Firebase CDN scripts and all cloud data are always fetched from the network; no stale auth tokens or Firestore data are served from cache.
- When fully offline, previously visited pages load from the shell cache. Cloud-backed data (tasks, notes) requires a connection.

---

## Authentication & Data

**Signed-in mode** (Google or email/password via Firebase Authentication): tasks, projects, labels, and notes are stored in Firestore and sync in real time.

**Demo Mode** (no account required): everything is stored in `localStorage` under the key `flow_data`. Data does not leave your device.

> If Firebase fails to connect, the auth screen shows a notice and Demo Mode is offered automatically.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Q` | Open "Add task" dialog |
| `D` | Toggle dark mode |
| `F` | Toggle focus mode |
| `Ctrl/Cmd + K` | Focus search |
| `Ctrl/Cmd + B` | Toggle sidebar |
| `G` then `I` | Go to Inbox |
| `G` then `T` | Go to Today |
| `G` then `C` | Go to Calendar |
| `G` then `N` | Go to Notes |
| `G` then `U` | Go to Upcoming |
| `Escape` | Close any open modal or panel |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styles | CSS3 (custom properties, Grid, Flexbox) |
| Logic | Vanilla JavaScript (ES2020+, no framework) |
| Authentication | Firebase Authentication (Google + Email/Password) |
| Database | Cloud Firestore (real-time listeners) |
| File storage | Firebase Storage (authenticated profile photo uploads) |
| Offline/demo | Browser `localStorage` |
| PWA | Web App Manifest + Service Worker (cache-first shell) |
| Fonts | Inter (Google Fonts) |
| Hosting | GitHub Pages |

No build step. No npm. No bundler. Served as static files.

---

## Architecture

```
Browser
  |
  +-- index.html    <-- App shell, all views, modals, Firebase init
  +-- style.css     <-- Styles, themes, layout
  +-- app.js        <-- All application logic
  +-- manifest.json <-- PWA metadata
  \-- sw.js         <-- Service Worker (shell caching only)
        |
        +-- State   <-- Single source of truth (tasks, notes, projects, labels, settings)
        +-- DB      <-- localStorage read/write (Demo Mode)
        \-- Firebase
              +-- Auth      <-- Google / Email sign-in
              +-- Firestore <-- Real-time listeners per collection
              \-- Storage   <-- Profile photo uploads
=======
## ⚡ Key Highlights

| 🔐 **Dual Mode System** | 🎯 **Productivity Focus** | 🎨 **Personalization** |
| :--- | :--- | :--- |
| • **Cloud Sync:** Firebase Auth + Firestore<br>• **Demo Mode:** Instant `localStorage` | • **Pomodoro Timer:** 25/5 min sessions<br>• **Analytics:** Daily goals & 7-day stats | • **Themes:** Dark / Light toggle<br>• **Accents:** Custom color choices |

---

## 🛠️ Features Breakdown

### 📋 Tasks & Organization
* ⚡ **Task Creation:** Priorities (P1–P4), due dates, times, and **subtask checklists**.
* 🔁 **Recurring Rules:** Daily, weekly, monthly, or weekday repeats.
* 📁 **Smart Views:** `Inbox` • `Today` • `Upcoming` • `Overdue` • `Completed` • `Someday`.

### 📅 Visual Calendar
* 🗓️ **4 Flexible Layouts:** Month Grid, 7-Day Week, Hourly Day, & Agenda List.
* 🖱️ **Quick Schedule:** Click any day or empty time cell to instantly create a task.

### 📝 Smart Notes
* ✍️ **Rich Text Editor:** Headings (H1-H3), code blocks, checklists, & formatting.
* 💾 **Auto-Save:** Saves automatically as you type with live status indicators.

### 👤 Profile & Customization
* 🎨 **Appearance:** Accent color selection, compact mode, and sidebar toggle.
* 🖼️ **Avatar Uploads:** Firebase Storage integration (or Base64 in Demo Mode).

---

## ⌨️ Keyboard Shortcuts

| Key Combo | Action | Key Combo | Action |
| :---: | :--- | :---: | :--- |
| `Ctrl + K` | 🔍 Search Everything | `G` then `I` | 📥 Go to Inbox |
| `Q` | ➕ Quick Add Task | `G` then `T` | 📅 Go to Today |
| `D` | 🌙 Toggle Dark Mode | `G` then `C` | 🗓️ Go to Calendar |
| `F` | 🖥️ Toggle Focus Mode | `G` then `N` | 📝 Go to Notes |
| `Ctrl + B` | 🗂️ Toggle Sidebar | `Esc` | ✖️ Close Dialogs |

---

<details>
<summary>📂 <b>Click to view Architecture & Tech Stack Details</b></summary>

<br>

### 💻 Tech Stack
* **Structure & UI:** Plain HTML5, CSS3 (Custom Properties & CSS Grid)
* **Logic:** Vanilla JavaScript (ES2020+, Zero Build Step)
* **Backend:** Firebase v10 CDN (Auth, Firestore, Storage)
* **Hosting:** GitHub Pages

### 🏗️ Architecture
```text
  🌐 Browser Application
   ├── 📄 index.html    (App Shell & Modals)
   ├── 🎨 style.css     (Tokens, Layout & Themes)
   └── ⚙️ app.js        (State & Logic)
         ├── 💾 Local DB   --> localStorage (Demo Mode)
         └── ☁️ Firebase   --> Auth + Firestore + Storage

>>>>>>> 6271f323ec3771ab10f41f6d466ee699ceeabf09
```

---

<<<<<<< HEAD
## Project Structure

```
TDL_ID/
+-- index.html    <-- App shell: auth, sidebar, views, modals
+-- app.js        <-- State, rendering, CRUD, events (~2100 lines)
+-- style.css     <-- Tokens, layout, components, dark mode (~1540 lines)
+-- manifest.json <-- PWA manifest
+-- sw.js         <-- Service Worker
\-- README.md
```

---

## Running Locally

No build step required.

```bash
git clone https://github.com/riogwv/TDL_ID.git
cd TDL_ID
```

Open `index.html` in a browser, or serve with any static server:

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .
```

> **Note:** Google sign-in requires `localhost` to be listed in Firebase Console → Authentication → Authorized Domains. Demo Mode works with no Firebase configuration. The Service Worker only activates over HTTPS or `localhost`.

---

## Known Limitations

- Export/Import works in Demo Mode only; in signed-in mode the export is a snapshot of local state but importing will not push data to Firestore (reload required after import in authenticated mode).
- Browser notifications and the Service Worker require HTTPS or `localhost`; they will not activate on plain `http://` origins.
- The Pomodoro timer state (current session, time remaining) is not persisted — refreshing the page resets it. Duration preferences are persisted in Demo Mode.
- Sound is generated via the Web Audio API; some browsers may block it until the user has interacted with the page.
- Cloud-backed data (tasks, notes) is not available offline — only the app shell is cached.

---

## Contributing

This is a personal project. Issues and pull requests are welcome.

1. Fork the repository
2. Make your changes in a feature branch
3. Open a pull request with a clear description of what changed and why

No tests or linters are configured. Keep changes minimal and consistent with the existing code style.

---

## License

No license file is currently present in this repository. If you intend to use or adapt this code, please contact the repository owner first.

---

<div align="center">

Built by [riogwv](https://github.com/riogwv) · Hosted on [GitHub Pages](https://riogwv.github.io/TDL_ID/)

</div>
=======
## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome! Feel free to check out the [issues page](https://www.google.com/search?q=https://github.com/riogwv/TDL_ID/issues).

### 📄 License

This project is currently personal software created for showcase and portfolio purposes. If you wish to adapt or use this codebase, please reach out to the owner first.

---

Built with 💡 by **[riogwv](https://github.com/riogwv)** · Hosted on **[GitHub Pages](https://riogwv.github.io/TDL_ID/)**
>>>>>>> 6271f323ec3771ab10f41f6d466ee699ceeabf09
