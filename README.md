
<div align="center">

# 🌊 Flow

### *"Simplicity is the ultimate sophistication."* — Leonardo da Vinci

**Tasks, Calendar & Notes — all in one place.**  
No installs required. No subscription fees. Just open your browser and get straight to work.

[![Open Flow App](https://img.shields.io/badge/🚀_OPEN_APP-Flow_Live-4F46E5?style=for-the-badge&logo=rocket)](https://riogwv.github.io/TDL_ID/)

---

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat-square&logo=github&logoColor=white)

</div>

---

## ⚡ Key Highlights

| 🔐 **Dual Mode System** | 🎯 **Focus & Productivity** | 🎨 **Full Customization** |
| :--- | :--- | :--- |
| • **Cloud Sync:** Firebase Auth + Firestore<br>• **Demo Mode:** Ultra-fast `localStorage` | • **Pomodoro Timer:** 25/5 min sessions + Audio<br>• **Dashboard:** Daily goals & 7-day stats | • **Themes:** Dark / Light mode (Press `D`) <br>• **Accents:** Customizable color palettes |

---

## 💡 Feature Breakdown

<details>
<summary><b>📋 Task Management & Scheduling (Click to expand)</b></summary>

<br>

* 🎯 **Priorities & Subtasks:** Set priorities (P1–P4), due dates, times, color-coded tags, and **subtask checklists**.
* 🔁 **Recurring Rules:** Schedule automatic daily, weekly, monthly, or weekday repeats.
* 📂 **Smart Views:**
  * 📥 **Inbox** — Unorganized tasks without due dates or projects.
  * 📅 **Today & Upcoming** — Focus on today's goals or plan up to 14 days ahead.
  * ⏳ **Overdue & Completed** — Easily track past-due items and recent progress.
</details>

<details>
<summary><b>🗓️ Visual Calendar (Click to expand)</b></summary>

<br>

* 📐 **4 Flexible Views:** Month Grid, 7-Day Week, Hourly Day, and Agenda List.
* 🖱️ **Quick Schedule:** Click any day or empty time slot to instantly create a pre-filled task.
</details>

<details>
<summary><b>📝 Smart Notes & Markdown Editor (Click to expand)</b></summary>

<br>

* ✍️ **Rich Text Editor:** Supports headings, bold/italic formatting, lists, code blocks, links, and checklists.
* 💾 **Auto-Save:** Saves automatically as you type with zero hassle.
* ⬇️ **Markdown Export:** Download your note as a standard `.md` file with a single click.
</details>

<details>
<summary><b>🔍 Powerful Search & Filters (Click to expand)</b></summary>

<br>

Press `Ctrl + K` (or `Cmd + K`) to launch global search with smart filter tokens:
* `p:1` to `p:4` — Filter by priority level
* `#labelname` — Filter by label
* `@projectname` — Filter by project
* `done:yes` / `done:no` — Filter by completion status
</details>

---

## ⌨️ Keyboard Shortcuts

Speed up your workflow using built-in keyboard shortcuts:

| Shortcut | Action | Shortcut | Action |
| :---: | :--- | :---: | :--- |
| `Ctrl + K` | 🔍 Smart Search | `G` then `I` | 📥 Go to Inbox |
| `Q` | ➕ Quick Add Task | `G` then `T` | 📅 Go to Today |
| `D` | 🌙 Toggle Dark/Light Mode | `G` then `C` | 🗓️ Go to Calendar |
| `F` | 🖥️ Focus Mode (Hide Sidebar) | `G` then `N` | 📝 Go to Notes |
| `Ctrl + B` | 🗂️ Toggle Sidebar | `Esc` | ✖️ Close Dialogs / Modals |

---

  <details>
  <summary>🏗️ <b>System Architecture</b></summary>
  
  <br>
  
  Built entirely with **Vanilla Web Technologies** — zero bundlers, npm, or build steps required.
  
  ```text
  🌐 Browser / Client
    ├── 📄 index.html     --> App shell, views, and modals
    ├── 🎨 style.css       --> CSS variables, layout, and themes
    └── ⚙️ app.js          --> Core application logic and state management
        ├── 💾 Local DB    --> localStorage (Demo Mode)
        └── ☁️ Firebase    --> Auth + Firestore + Storage
  
  ```
  </details>
  ---
  <details>
  <summary>🚀 <b>Quick Local Setup</b></summary>
  
  <br>
  
  Want to try or develop Flow on your local machine? No build steps required!
  
  1. **Clone the repository**
  ```bash
  git clone [https://github.com/riogwv/TDL_ID.git](https://github.com/riogwv/TDL_ID.git)
  cd TDL_ID
  
  ```
  
  
  2. **Launch instantly**
  * Double-click `index.html` to open directly in your browser, **OR**
  * Run a lightweight local server:
  ```bash
  python3 -m http.server 8080
  
  ```
  </details>
  
  
  
  ---
  
  Built with 💡 by **[riogwv](https://github.com/riogwv)** · Hosted on **[GitHub Pages](https://riogwv.github.io/TDL_ID/)**
