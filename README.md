<div align="center">

# Flow

**Tasks, Calendar & Notes — all in one place.**

A clean, free workspace for organizing your day.  
No installs. No subscriptions. Just open and go.

[**Open Flow →**](https://riogwv.github.io/TDL_ID/)

---

![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-181717?style=flat&logo=github&logoColor=white)

</div>

---

## What is Flow?

Flow is a personal productivity app that lives entirely in your browser.  
It brings together tasks, a calendar, and rich notes — the three things most people actually need — without scattering them across multiple apps.

Sign in with Google or email to sync your data across devices via Firestore.  
Or skip sign-in entirely and use **Demo Mode**, which stores everything locally in your browser with sample data pre-loaded so you can start immediately.

---

## Features

### 📋 Tasks
Create tasks with a title, description, due date, due time, and priority (P1–P4).  
Organize them into **Projects** and tag them with **Labels** — both color-coded and listed in the sidebar.  
Each task supports **subtasks**, which you can check off individually from the task detail panel.

Set a task to repeat **daily, weekly, monthly, or on weekdays**; completing a recurring task automatically reschedules it to its next occurrence instead of marking it done.

Tasks are sorted across focused views:

| View | What it shows |
|---|---|
| **Inbox** | Tasks with no project and no due date |
| **Today** | Tasks due today |
| **Upcoming** | Future tasks grouped by date (up to 14 days) |
| **Overdue** | Past-due tasks that haven't been completed |
| **Completed** | The last 50 completed tasks |
| **Someday** | Tasks with no due date, regardless of project |

A live count badge on Inbox, Today, and Overdue keeps you aware of what needs attention without switching views.

### 📅 Calendar
View your tasks visually across four layouts:

- **Month** — a grid of the current month; click any day to add a task pre-filled with that date
- **Week** — a 7-column hourly grid; tasks with a time slot appear at the right hour
- **Day** — a single-day hourly view
- **Agenda** — a chronological list of all upcoming tasks

All calendar views are clickable: click an event to open the task detail panel; click an empty cell to create a task.

### 📝 Notes
A sidebar panel lists all your notes, sorted by last edit, with a search field to filter them.  
Open any note in a rich-text editor that supports **bold, italic, underline, headings (H1–H3), bulleted lists, ordered lists, code blocks, links, and checklists**.

Notes save automatically as you type (1-second debounce). The save status ("Saving…" / "Saved") is shown at the top of the editor.

### 📊 Dashboard
A lightweight stats view showing:
- Tasks completed today vs. your configurable daily goal (with a progress bar)
- A 7-day bar chart of completed tasks
- Total active tasks, projects, and notes

### ⏱ Pomodoro Timer
A built-in focus timer on the Dashboard. Runs 25-minute work sessions followed by 5-minute short breaks and a 15-minute long break every 4 sessions. Includes Start/Pause, Reset, and Skip controls. The browser tab title updates to show the countdown while a session is running.

### 🔍 Search
A global search bar in the top bar (also triggered by `Ctrl/Cmd + K`) searches tasks, notes, and projects simultaneously. Results appear in a dropdown, and clicking one navigates directly to that item.

### 🎨 Appearance
- **Light / Dark mode** — toggle in Settings or press `D`
- **Accent color** — choose from a set of preset colors in Settings
- **Compact mode** — reduces task item padding for denser lists
- **Collapsible sidebar** — click the menu icon or press `Ctrl/Cmd + B`
- **Focus mode** — hides the sidebar; press `F` to toggle

### ⚙️ Settings
Configurable options:
- Dark mode and compact mode toggles
- Accent color picker
- Task sort order (by creation date, priority, due date, or alphabetical)
- Daily goal (number of tasks to complete per day)
- Date format (MMM D / D MMM / MM/DD / DD/MM)
- Time format (12h / 24h)
- Sign out

### 👤 Profile
Edit your display name, bio (up to 200 characters), and avatar.  
You can paste an image URL or upload a photo directly. In authenticated mode, photos are stored in Firebase Storage; in Demo Mode, they're stored as Base64 in localStorage.

---

## Authentication & Data

Flow supports two modes:

**Signed-in mode** (Google or email/password via Firebase Authentication)  
Your tasks, projects, labels, and notes are stored in **Firestore** and sync in real time. Your profile (name, bio, avatar) is stored in a separate `profiles` collection and in Firebase Authentication. Data is scoped to your account — other users cannot see it.

**Demo Mode** (no account required)  
Everything is stored in your browser's `localStorage` under the key `flow_data`. Sample tasks and notes are pre-seeded on first launch. Data does not leave your device and is lost if you clear browser storage.

> If Firebase fails to connect (e.g. offline, or blocked by a browser extension), the auth screen shows a notice and Demo Mode is offered automatically.

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
| `Escape` | Close any open modal or detail panel |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styles | CSS3 (custom properties, CSS Grid, Flexbox) |
| Logic | Vanilla JavaScript (ES2020+, no framework) |
| Authentication | Firebase Authentication (Google + Email/Password) |
| Database | Cloud Firestore (real-time listeners) |
| File storage | Firebase Storage (profile photo uploads) |
| Offline/demo | Browser `localStorage` |
| Fonts | Inter (Google Fonts) |
| Hosting | GitHub Pages |

No build step. No npm. No bundler. The app is served as static files.

---

## Architecture

```text
Browser
  |
  +-- index.html          <-- App shell, all views, modals
  +-- style.css           <-- Styles, themes, layout
  \-- app.js              <-- All application logic
        |
        +-- State object  <-- Single source of truth (tasks, notes, projects, labels, settings)
        |
        +-- DB layer      <-- localStorage read/write for Demo Mode
        |
        \-- Firebase layer
              +-- Auth      <-- Google / Email sign-in, session persistence
              +-- Firestore <-- Real-time listeners per collection (tasks, projects, labels, notes)
              \-- Storage   <-- Profile photo uploads

```

The Firebase SDK (v10) is loaded as an ES module directly from the Google CDN — no local install. `app.js` is plain non-module JS that receives the initialized Firebase handles via a `window._fb` promise bridge set up in `index.html`.

---

## Project Structure

```text
TDL_ID/
+-- index.html      <-- App shell: auth screen, sidebar, views, modals, Firebase init
+-- app.js          <-- All state management, rendering, Firebase CRUD, event wiring (~1770 lines)
+-- style.css       <-- All styles: tokens, layout, components, dark mode (~1500 lines)
\-- README.md

```

---

## Running Locally

No build step is required.

```bash
git clone [https://github.com/riogwv/TDL_ID.git](https://github.com/riogwv/TDL_ID.git)
cd TDL_ID

```

Then open `index.html` directly in a browser, or serve it with any static file server:

```bash
# Python
python3 -m http.server 8080

# Node.js (if npx is available)
npx serve .

```

Open `http://localhost:8080` in your browser.

> **Note:** Google sign-in requires the origin to be listed in Firebase Console → Authentication → Authorized Domains. For local development, add `localhost`. Demo Mode works without any Firebase configuration.

---

## Contributing

This is a personal project. Issues and pull requests are welcome.

1. Fork the repository
2. Make your changes in a feature branch
3. Open a pull request with a clear description of what changed and why

There are no tests or linters configured. Keep changes minimal and consistent with the existing code style.

---

## License

No license file is currently present in this repository.

If you intend to use or adapt this code, please contact the repository owner first.

---

Built by [riogwv](https://github.com/riogwv) · Hosted on [GitHub Pages](https://riogwv.github.io/TDL_ID/)
