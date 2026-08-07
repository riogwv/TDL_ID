'use strict';

// ─── STATE ────────────────────────────────────────────────────────────────────
const state = {
  user: null,
  profile: { displayName: '', bio: '', photoURL: '' },
  tasks: [],
  projects: [],
  labels: [],
  notes: [],
  currentView: 'inbox',
  currentProjectId: null,
  currentLabelId: null,
  selectedTaskId: null,
  selectedNoteId: null,
  calView: 'month',
  calDate: new Date(),
  editingTaskId: null,
  taskModal:    { priority: 4 },
  projectModal: { color: '#DC4C3E' },
  labelModal:   { color: '#DC4C3E' },
  settings: {
    darkMode: false,
    compact: false,
    accentColor: '#DC4C3E',
    sort: 'created',
    dailyGoal: 5,
    dateFormat: 'MMM D',
    timeFormat: '12h'
  },
  pomodoro: {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    session: 1,
    mode: 'work',
    remaining: 25 * 60,
    running: false,
    timer: null
  },
  demoMode: false,
  unsubscribers: []
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls)             e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_S   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_XS  = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function formatDate(dateStr, fmt = state.settings.dateFormat) {
  if (!dateStr) return '';
  const d  = new Date(dateStr + 'T00:00:00');
  const m  = MONTHS_S[d.getMonth()];
  const day= d.getDate();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  if (fmt === 'MMM D') return `${m} ${day}`;
  if (fmt === 'D MMM') return `${day} ${m}`;
  if (fmt === 'MM/DD') return `${mm}/${dd}`;
  return `${dd}/${mm}`;
}
function formatTime(t) {
  if (!t) return '';
  if (state.settings.timeFormat !== '12h') return t;
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function isToday(dateStr) {
  if (!dateStr) return false;
  const t = new Date(), d = new Date(dateStr + 'T00:00:00');
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}
function isOverdue(dateStr) {
  if (!dateStr) return false;
  const t = new Date(); t.setHours(0,0,0,0);
  return new Date(dateStr + 'T00:00:00') < t;
}
function toDateStr(d) { return d.toISOString().split('T')[0]; }
function uid()        { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(msg, duration = 3000) {
  const c = $('toast-container');
  const t = el('div', 'toast', escapeHtml(msg));
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, duration);
}

// ─── LOCAL STORAGE (demo mode) ────────────────────────────────────────────────
const DB = {
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('flow_data') || '{}');
      state.tasks    = d.tasks    || [];
      state.projects = d.projects || [];
      state.labels   = d.labels   || [];
      state.notes    = d.notes    || [];
      state.settings = { ...state.settings, ...(d.settings || {}) };
      state.profile  = { ...state.profile,  ...(d.profile  || {}) };
      if (!state.tasks.length) DB.seed();
    } catch(e) { DB.seed(); }
  },
  save() {
    localStorage.setItem('flow_data', JSON.stringify({
      tasks: state.tasks, projects: state.projects,
      labels: state.labels, notes: state.notes,
      settings: state.settings, profile: state.profile
    }));
  },
  seed() {
    const today     = toDateStr(new Date());
    const tomorrow  = toDateStr(new Date(Date.now() + 86400000));
    const yesterday = toDateStr(new Date(Date.now() - 86400000));
    state.projects = [
      { id: 'p1', name: 'Work',     color: '#0ea5e9', createdAt: Date.now() },
      { id: 'p2', name: 'Personal', color: '#22c55e', createdAt: Date.now() }
    ];
    state.labels = [
      { id: 'l1', name: 'urgent', color: '#DC4C3E' },
      { id: 'l2', name: 'focus',  color: '#8b5cf6' }
    ];
    state.tasks = [
      { id: uid(), title: 'Welcome to Flow! 👋', desc: 'Click any task to see details. Press Q to add a new task.', done: false, priority: 4, projectId: '', labelId: '', dueDate: today,     dueTime: '', recurring: '', createdAt: Date.now(),      subtasks: [] },
      { id: uid(), title: 'Prepare weekly review slides', desc: "Cover last week's OKRs and blockers", done: false, priority: 1, projectId: 'p1', labelId: 'l2', dueDate: today,     dueTime: '10:00', recurring: '', createdAt: Date.now()-1000,  subtasks: [{id:uid(),title:'Gather metrics',done:false},{id:uid(),title:'Draft agenda',done:false}] },
      { id: uid(), title: 'Buy groceries',             desc: '',                           done: false, priority: 4, projectId: 'p2', labelId: '', dueDate: today,     dueTime: '', recurring: '', createdAt: Date.now()-2000,  subtasks: [] },
      { id: uid(), title: 'Reply to emails',           desc: '',                           done: false, priority: 2, projectId: 'p1', labelId: 'l1', dueDate: yesterday, dueTime: '', recurring: 'daily', createdAt: Date.now()-3000, subtasks: [] },
      { id: uid(), title: 'Read Design Systems book',  desc: '',                           done: false, priority: 3, projectId: 'p2', labelId: 'l2', dueDate: tomorrow,  dueTime: '', recurring: '', createdAt: Date.now()-4000,  subtasks: [] },
      { id: uid(), title: 'Plan Q3 roadmap',           desc: '',                           done: false, priority: 1, projectId: 'p1', labelId: '', dueDate: '',        dueTime: '', recurring: '', createdAt: Date.now()-5000,  subtasks: [] },
      { id: uid(), title: 'Set up home server eventually', desc: '',                       done: false, priority: 4, projectId: '', labelId: '',  dueDate: '',        dueTime: '', recurring: '', createdAt: Date.now()-6000,  subtasks: [] }
    ];
    state.notes = [
      { id: uid(), title: 'Getting started', content: '<h2>Welcome to Flow Notes</h2><p>Use the toolbar to format your notes. Notes save automatically as you type.</p><p>You can use <b>bold</b>, <i>italic</i>, headings, lists, and more.</p>', updatedAt: Date.now() }
    ];
    DB.save();
  }
};

// ─── FIREBASE LAYER ───────────────────────────────────────────────────────────
function isFirebaseReady() {
  return !!(window._fb?.auth && window._fb?.db);
}

function initFirebase() {
  if (!isFirebaseReady()) return false;
  try {
    window._fb.onAuthStateChanged(window._fb.auth, async user => {
      if (user) {
        state.demoMode = false;
        state.user = user;
        // Load persisted profile from Firestore if available.
        try {
          const { db, doc, getDoc } = window._fb;
          const snap = await getDoc(doc(db, 'profiles', user.uid));
          if (snap.exists()) {
            const d = snap.data();
            state.profile = {
              displayName: d.displayName || '',
              photoURL:    d.photoURL    || '',
              bio:         d.bio         || ''
            };
          }
        } catch (_) { /* non-fatal */ }
        showApp(user);
        subscribeFirestore(user.uid);
      } else {
        showAuth();
      }
    });
    return true;
  } catch (e) {
    console.error('[Flow] Firebase auth setup failed:', e);
    return false;
  }
}

function subscribeFirestore(uid) {
  const { db, collection, query, where, onSnapshot } = window._fb;
  const colKeys = { tasks:'tasks', projects:'projects', labels:'labels', notes:'notes' };
  state.unsubscribers = Object.keys(colKeys).map(col =>
    onSnapshot(
      query(collection(db, col), where('uid','==', uid)),
      snap => { state[colKeys[col]] = snap.docs.map(d => ({ id: d.id, ...d.data() })); renderAll(); },
      err  => console.error('[Flow] Firestore error:', err)
    )
  );
}

// Generic Firebase CRUD helpers — fall through to demo mode if needed
async function fbAdd(col, data) {
  if (state.demoMode) {
    state[col].unshift ? state[col].unshift(data) : state[col].push(data);
    DB.save(); renderAll(); return data.id;
  }
  const { db, collection, addDoc, serverTimestamp } = window._fb;
  const ref = await addDoc(collection(db, col), { ...data, uid: state.user.uid, createdAt: serverTimestamp() });
  return ref.id;
}
async function fbUpdate(col, id, data) {
  if (state.demoMode) {
    const i = state[col].findIndex(x => x.id === id);
    if (i >= 0) Object.assign(state[col][i], data);
    DB.save(); renderAll(); return;
  }
  const { db, doc, updateDoc } = window._fb;
  await updateDoc(doc(db, col, id), data);
}
async function fbDelete(col, id) {
  if (state.demoMode) {
    state[col] = state[col].filter(x => x.id !== id);
    DB.save(); renderAll(); return;
  }
  const { db, doc, deleteDoc } = window._fb;
  await deleteDoc(doc(db, col, id));
}

// Semantic wrappers
const fbAddTask    = data => fbAdd('tasks', data);
const fbUpdateTask = (id, data) => fbUpdate('tasks', id, data);
const fbDeleteTask = id => fbDelete('tasks', id);
const fbAddProject = data => fbAdd('projects', data);
const fbDeleteProject = id => fbDelete('projects', id);
const fbAddLabel   = data => fbAdd('labels', data);
async function fbAddNote(note) {
  if (state.demoMode) { state.notes.unshift(note); DB.save(); renderNotesList(); return note.id; }
  return fbAdd('notes', note);
}
async function fbUpdateNote(id, data) {
  if (state.demoMode) { const i = state.notes.findIndex(n => n.id === id); if (i>=0) Object.assign(state.notes[i], data); DB.save(); return; }
  return fbUpdate('notes', id, data);
}
async function fbDeleteNote(id) {
  if (state.demoMode) { state.notes = state.notes.filter(n => n.id !== id); DB.save(); renderNotesList(); return; }
  return fbDelete('notes', id);
}

// Profile modal button wiring (elements added to HTML)
document.addEventListener('DOMContentLoaded', () => {
  // ── User menu trigger ──────────────────────────────────────────────────────
  const trigger = $('user-menu-trigger');
  if (trigger) {
    trigger.addEventListener('click',   openProfileModal);
    trigger.addEventListener('keydown', e => e.key === 'Enter' && openProfileModal());
  }

  // ── Profile modal controls ─────────────────────────────────────────────────
  $('profile-modal-close')?.addEventListener('click',  () => closeModal('profile-modal-overlay'));
  $('profile-modal-cancel')?.addEventListener('click', () => closeModal('profile-modal-overlay'));
  $('profile-modal-save')?.addEventListener('click',   saveProfile);

  // Photo preview on URL input
  $('profile-photo-input')?.addEventListener('input', () => {
    const url  = $('profile-photo-input').value.trim();
    const prev = $('profile-photo-preview');
    if (prev) {
      prev.src          = url;
      prev.style.display= url ? 'block' : 'none';
    }
  });

  // File upload for profile picture
  $('profile-photo-upload')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Please select an image file'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      const photoInput = $('profile-photo-input');
      if (photoInput) photoInput.value = dataUrl;
      const prev = $('profile-photo-preview');
      if (prev) { prev.src = dataUrl; prev.style.display = 'block'; }
    };
    reader.readAsDataURL(file);
  });
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function updateAuthUI(firebaseAvailable) {
  const note = $('auth-demo-note');
  const googleBtn = $('btn-google-signin');
  const emailSignin = $('btn-email-signin');
  const emailSignup = $('btn-email-signup');
  const demoBtn = $('btn-demo-mode');

  if (firebaseAvailable) {
    if (note) note.hidden = true;
    if (googleBtn) googleBtn.disabled = false;
    if (emailSignin) emailSignin.disabled = false;
    if (emailSignup) emailSignup.disabled = false;
    if (demoBtn) demoBtn.hidden = false;
  } else {
    if (note) note.hidden = false;
    if (googleBtn) googleBtn.disabled = true;
    if (emailSignin) emailSignin.disabled = true;
    if (emailSignup) emailSignup.disabled = true;
    if (demoBtn) demoBtn.hidden = false;
  }
}

function showAuth() {
  $('auth-screen').style.display = 'flex';
  $('app').classList.add('hidden');
}
function showApp(user) {
  $('auth-screen').style.display = 'none';
  $('app').classList.remove('hidden');
  refreshUserDisplay();
  applySettings();
  renderAll();
}

function refreshUserDisplay() {
  const user = state.user;
  // Profile state overrides Firebase user fields if set.
  const displayName = state.profile.displayName || user?.displayName || 'Demo User';
  const email       = user?.email || 'demo@flow.app';
  const photoURL    = state.profile.photoURL || user?.photoURL || '';

  $('user-display-name').textContent  = displayName;
  $('user-display-email').textContent = email;
  const settingsEmail = $('settings-user-email');
  if (settingsEmail) settingsEmail.textContent = email;

  const av = $('user-avatar');
  if (photoURL) {
    av.innerHTML = `<img src="${escapeHtml(photoURL)}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  } else {
    av.textContent = displayName.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}

// ─── PROFILE MODAL ────────────────────────────────────────────────────────────
function openProfileModal() {
  const overlay   = $('profile-modal-overlay');
  const nameInput = $('profile-name-input');
  const photoInput= $('profile-photo-input');
  const bioInput  = $('profile-bio-input');

  // Fail-safe: abort if any required modal element is missing.
  if (!overlay || !nameInput || !photoInput || !bioInput) {
    console.error('[Flow] openProfileModal: one or more required modal elements are missing.');
    return;
  }

  const user = state.user;
  nameInput.value  = state.profile.displayName || user?.displayName || '';
  photoInput.value = state.profile.photoURL    || user?.photoURL    || '';
  bioInput.value   = state.profile.bio         || '';

  // Sync photo preview with current URL value.
  const prev = $('profile-photo-preview');
  if (prev) {
    prev.src          = photoInput.value;
    prev.style.display= photoInput.value ? 'block' : 'none';
  }

  openModal('profile-modal-overlay');
  setTimeout(() => nameInput.focus(), 80);
}

// user-menu-trigger listeners are wired inside the DOMContentLoaded block below.

async function saveProfile() {
  const displayName = $('profile-name-input').value.trim();
  const photoURL    = $('profile-photo-input').value.trim();
  const bio         = $('profile-bio-input').value.trim();

  if (!displayName) { toast('Enter a display name'); $('profile-name-input').focus(); return; }

  state.profile = { displayName, photoURL, bio };

  if (state.demoMode) {
    DB.save();
  } else if (isFirebaseReady() && state.user) {
    const { db, doc, setDoc, serverTimestamp } = window._fb;
try {
      // updateProfile for display name / photo (hanya kirim photoURL ke Auth jika BUKAN Base64 panjang)
      const { updateProfile } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      
      const isBase64 = photoURL && photoURL.startsWith('data:image/');
      const authPhoto = (photoURL && !isBase64 && photoURL.length < 2000) ? photoURL : undefined;

      await updateProfile(state.user, {
        displayName: displayName || undefined,
        photoURL: authPhoto
      });

      // Also persist full profile (including bio & Base64 photo) to Firestore
      await setDoc(doc(db, 'profiles', state.user.uid), {
        displayName, photoURL, bio, updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error('[Flow] Profile update failed:', err);
      toast('Profile saved locally (Firebase update failed)');
      // Still persist locally as fallback
    }
  }

  refreshUserDisplay();
  closeModal('profile-modal-overlay');
  toast('Profile updated ✓');
}

$('btn-google-signin').onclick = async () => {
  if (!isFirebaseReady()) { toast('Firebase is not available. Use demo mode instead.'); return; }
  try {
    await window._fb.signInWithPopup(window._fb.auth, window._fb.provider);
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') toast('Sign in failed: ' + e.message);
  }
};

$('btn-email-signin').onclick = async () => {
  if (!isFirebaseReady()) { toast('Firebase is not available. Use demo mode instead.'); return; }
  const email    = $('auth-email').value.trim();
  const password = $('auth-password').value;
  if (!email || !password) { toast('Enter email and password'); return; }
  try {
    await window._fb.signInWithEmailAndPassword(window._fb.auth, email, password);
  } catch(e) { toast('Sign in failed: ' + e.message); }
};

$('btn-email-signup').onclick = async () => {
  if (!isFirebaseReady()) { toast('Firebase is not available. Use demo mode instead.'); return; }
  const email    = $('auth-email').value.trim();
  const password = $('auth-password').value;
  if (!email || !password) { toast('Enter email and password'); return; }
  try {
    await window._fb.createUserWithEmailAndPassword(window._fb.auth, email, password);
  } catch(e) { toast('Sign up failed: ' + e.message); }
};

$('btn-signout').onclick = async () => {
  state.unsubscribers.forEach(u => u?.());
  state.unsubscribers = [];
  if (!state.demoMode && isFirebaseReady()) await window._fb.signOut(window._fb.auth);
  state.demoMode = false;
  state.user = null;
  showAuth();
};

$('btn-demo-mode').onclick = () => enterDemo();

function enterDemo() {
  state.demoMode = true;
  state.user = { displayName: 'Demo User', email: 'demo@flow.app' };
  DB.load();
  showApp(state.user);
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function applySettings() {
  const { darkMode, compact, accentColor } = state.settings;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  $('toggle-dark')?.classList.toggle('on', darkMode);
  $('toggle-compact')?.classList.toggle('on', compact);
  $('theme-icon-moon').style.display = darkMode ? 'none'  : 'block';
  $('theme-icon-sun').style.display  = darkMode ? 'block' : 'none';
  if (accentColor) document.documentElement.style.setProperty('--primary', accentColor);
  document.querySelectorAll('.accent-dot').forEach(d => {
    d.classList.toggle('selected', d.dataset.color === accentColor);
    d.setAttribute('aria-checked', d.dataset.color === accentColor ? 'true' : 'false');
  });
  const s = state.settings;
  if ($('setting-sort'))        $('setting-sort').value        = s.sort;
  if ($('setting-daily-goal'))  $('setting-daily-goal').value  = s.dailyGoal;
  if ($('setting-date-format')) $('setting-date-format').value = s.dateFormat;
  if ($('setting-time-format')) $('setting-time-format').value = s.timeFormat;
  if (compact) document.querySelectorAll('.task-item').forEach(e => e.style.padding = '5px 8px');
  else         document.querySelectorAll('.task-item').forEach(e => e.style.padding = '');
}

$('toggle-dark').onclick    = () => { state.settings.darkMode  = !state.settings.darkMode;  applySettings(); DB.save(); };
$('toggle-compact').onclick = () => { state.settings.compact   = !state.settings.compact;   applySettings(); DB.save(); };
$('btn-theme').onclick      = () => { state.settings.darkMode  = !state.settings.darkMode;  applySettings(); DB.save(); };

document.querySelectorAll('.accent-dot').forEach(dot => {
  dot.onclick  = () => { state.settings.accentColor = dot.dataset.color; applySettings(); DB.save(); };
  dot.onkeydown= e => e.key === 'Enter' && dot.click();
});

$('setting-sort')?.addEventListener('change',        e => { state.settings.sort       = e.target.value;             DB.save(); renderTaskViews(); });
$('setting-daily-goal')?.addEventListener('change',  e => { state.settings.dailyGoal  = parseInt(e.target.value)||5; DB.save(); renderProductivity(); });
$('setting-date-format')?.addEventListener('change', e => { state.settings.dateFormat  = e.target.value;             DB.save(); renderTaskViews(); });
$('setting-time-format')?.addEventListener('change', e => { state.settings.timeFormat  = e.target.value;             DB.save(); renderTaskViews(); });

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function navigate(view, extra = {}) {
  state.currentView      = view;
  state.currentProjectId = extra.projectId || null;
  state.currentLabelId   = extra.labelId   || null;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('[data-view]').forEach(n => {
    n.classList.toggle('active', n.dataset.view === view);
    if (n.dataset.view === view) n.setAttribute('aria-current', 'page');
    else n.removeAttribute('aria-current');
  });

  const viewEl = $('view-' + view);
  if (viewEl) viewEl.classList.add('active');

  const TITLES = { inbox:'Inbox', today:'Today', upcoming:'Upcoming', overdue:'Overdue',
    completed:'Completed', someday:'Someday', calendar:'Calendar', notes:'Notes',
    productivity:'Dashboard', settings:'Settings' };
  let title = TITLES[view] || view;

  if (view === 'project' && extra.projectId) {
    const p = state.projects.find(p => p.id === extra.projectId);
    title = p?.name || 'Project';
    $('project-view-title').textContent = title;
    renderProjectView();
  }
  if (view === 'label' && extra.labelId) {
    const l = state.labels.find(l => l.id === extra.labelId);
    title = '#' + (l?.name || 'label');
    $('label-view-title').textContent = title;
    renderLabelView();
  }

  const tb = $('topbar');
  if (tb) {
    const existingTitle = tb.querySelector('.topbar-title');
    if (existingTitle) {
      existingTitle.textContent = title;
    } else {
      const titleEl   = el('span', 'topbar-title', escapeHtml(title));
      const searchBar = $('search-bar');
      if (searchBar && searchBar.parentNode === tb) {
        tb.insertBefore(titleEl, searchBar);
      } else if (tb.children.length > 1) {
        tb.insertBefore(titleEl, tb.children[1]);
      } else {
        tb.appendChild(titleEl);
      }
    }
  }

  if (view === 'calendar')     renderCalendar();
  if (view === 'notes')        renderNotesList();
  if (view === 'productivity') renderProductivity();

  if (window.innerWidth < 768) $('detail-panel').classList.remove('open');
}

document.querySelectorAll('[data-view]').forEach(item => {
  item.onclick  = () => navigate(item.dataset.view);
  item.onkeydown= e => e.key === 'Enter' && navigate(item.dataset.view);
});

// ─── SIDEBAR (initSidebar) ────────────────────────────────────────────────────
// All sidebar toggle, persistence, keyboard shortcut, and responsive logic
// is encapsulated here. Call once after the DOM is ready.
function initSidebar() {
  const sidebar      = $('sidebar');
  const toggleBtn    = $('sidebar-toggle');
  const STORAGE_KEY  = 'sidebar_collapsed';

  if (!sidebar || !toggleBtn) return;

  /** Apply collapsed state to DOM and persist preference */
  function applyCollapsed(collapsed, persist = true) {
    sidebar.classList.toggle('collapsed', collapsed);
    toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    toggleBtn.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
    if (persist) localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false');
  }

  /** Toggle and flip current state */
  function toggleSidebar() {
    applyCollapsed(!sidebar.classList.contains('collapsed'));
  }

  // Restore saved state on load
  const savedCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';
  applyCollapsed(savedCollapsed, false);

  // Toggle button click
  toggleBtn.addEventListener('click', toggleSidebar);

  // Ctrl+B / Cmd+B keyboard shortcut
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      // Only fire when no text input is focused
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      toggleSidebar();
    }
  });

  // Responsive: when switching from mobile → desktop, restore saved preference
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  mobileQuery.addEventListener('change', mq => {
    if (!mq.matches) applyCollapsed(localStorage.getItem(STORAGE_KEY) === 'true', false);
  });

  // Tooltip positioning: set --tip-top so the fixed ::after appears at the right Y
  // (sidebar overflow-x:hidden clips absolute children; fixed escapes that)
  sidebar.addEventListener('mouseover', e => {
    const item = e.target.closest('.nav-item[aria-label]');
    if (!item || !sidebar.classList.contains('collapsed')) return;
    const rect = item.getBoundingClientRect();
    item.style.setProperty('--tip-top', `${rect.top + rect.height / 2}px`);
  });
}

// Mobile sidebar open/close (separate from desktop collapse)
function openMobileSidebar() {
  $('sidebar').classList.add('mobile-open');
  $('sidebar-backdrop').classList.add('visible');
  $('mobile-menu-btn').setAttribute('aria-expanded', 'true');
}
function closeMobileSidebar() {
  $('sidebar').classList.remove('mobile-open');
  $('sidebar-backdrop').classList.remove('visible');
  $('mobile-menu-btn').setAttribute('aria-expanded', 'false');
}
$('mobile-menu-btn').onclick = () => {
  $('sidebar').classList.contains('mobile-open') ? closeMobileSidebar() : openMobileSidebar();
};
$('sidebar-backdrop').onclick = closeMobileSidebar;

$('btn-focus-mode').onclick  = () => {
  document.body.classList.toggle('focus-mode');
  toast(document.body.classList.contains('focus-mode') ? 'Focus mode on — press F to exit' : 'Focus mode off');
};
$('btn-settings').onclick = e => { e.stopPropagation(); navigate('settings'); };

// ─── PROJECTS NAV ─────────────────────────────────────────────────────────────
function renderProjectsNav() {
  const container = $('projects-nav');
  container.innerHTML = '';
  state.projects.forEach(p => {
    const item = el('div', 'nav-item' + (state.currentView === 'project' && state.currentProjectId === p.id ? ' active' : ''));
    item.setAttribute('role', 'listitem');
    const dot  = el('span', 'project-color-dot');
    dot.style.background = p.color;
    const name = el('span', '', escapeHtml(p.name));
    const cnt  = el('span', 'count', String(state.tasks.filter(t => t.projectId === p.id && !t.done).length));
    item.append(dot, name, cnt);
    item.onclick   = () => navigate('project', { projectId: p.id });
    item.onkeydown = e => e.key === 'Enter' && item.click();
    item.tabIndex  = 0;
    container.appendChild(item);
  });
}
function renderLabelsNav() {
  const container = $('labels-nav');
  container.innerHTML = '';
  state.labels.forEach(l => {
    const item = el('div', 'nav-item' + (state.currentView === 'label' && state.currentLabelId === l.id ? ' active' : ''));
    item.setAttribute('role', 'listitem');
    const dot  = el('span', 'project-color-dot');
    dot.style.cssText = `background:${l.color};border-radius:50%`;
    const name = el('span', '', '#' + escapeHtml(l.name));
    item.append(dot, name);
    item.onclick   = () => navigate('label', { labelId: l.id });
    item.onkeydown = e => e.key === 'Enter' && item.click();
    item.tabIndex  = 0;
    container.appendChild(item);
  });
}

// ─── PROJECT MODAL ────────────────────────────────────────────────────────────
$('btn-add-project').onclick     = () => openModal('project-modal-overlay');
$('project-modal-close').onclick = () => closeModal('project-modal-overlay');
$('project-modal-cancel').onclick= () => closeModal('project-modal-overlay');
$('project-modal-save').onclick  = async () => {
  const name = $('project-name-input').value.trim();
  if (!name) { toast('Enter a project name'); return; }
  await fbAddProject({ id: uid(), name, color: state.projectModal.color, createdAt: Date.now() });
  $('project-name-input').value = '';
  closeModal('project-modal-overlay');
  toast('Project created');
};
bindColorPicker('project-color-picker', 'projectModal');

// ─── LABEL MODAL ──────────────────────────────────────────────────────────────
$('btn-add-label').onclick     = () => openModal('label-modal-overlay');
$('label-modal-close').onclick = () => closeModal('label-modal-overlay');
$('label-modal-cancel').onclick= () => closeModal('label-modal-overlay');
$('label-modal-save').onclick  = async () => {
  const name = $('label-name-input').value.trim().replace(/\s+/g,'').toLowerCase();
  if (!name) { toast('Enter a label name'); return; }
  await fbAddLabel({ id: uid(), name, color: state.labelModal.color });
  $('label-name-input').value = '';
  closeModal('label-modal-overlay');
  toast('Label created');
};
bindColorPicker('label-color-picker', 'labelModal');

function bindColorPicker(pickerId, stateKey) {
  document.querySelectorAll(`#${pickerId} .color-option`).forEach(d => {
    d.onclick = () => {
      document.querySelectorAll(`#${pickerId} .color-option`).forEach(x => {
        x.classList.remove('selected');
        x.setAttribute('aria-checked','false');
      });
      d.classList.add('selected');
      d.setAttribute('aria-checked','true');
      state[stateKey].color = d.dataset.color;
    };
    d.onkeydown = e => e.key === 'Enter' && d.click();
  });
}

// ─── TASK MODAL ───────────────────────────────────────────────────────────────
function openTaskModal(task = null) {
  state.editingTaskId = task?.id || null;
  const isEdit = !!task;
  $('task-modal-title').textContent  = isEdit ? 'Edit task'    : 'Add task';
  $('task-modal-save').textContent   = isEdit ? 'Save changes' : 'Add task';
  $('task-title-input').value        = task?.title     || '';
  $('task-desc-input').value         = task?.desc      || '';
  $('task-date-input').value         = task?.dueDate   || '';
  $('task-time-input').value         = task?.dueTime   || '';
  $('task-recurring-input').value    = task?.recurring || '';

  const prio = task?.priority ?? 4;
  document.querySelectorAll('.priority-btn').forEach(b => {
    const active = parseInt(b.dataset.priority) === prio;
    b.classList.toggle('selected', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  state.taskModal.priority = prio;

  const ps = $('task-project-input');
  ps.innerHTML = '<option value="">— Inbox —</option>';
  state.projects.forEach(p => {
    const o = el('option', '', escapeHtml(p.name));
    o.value = p.id;
    if (task?.projectId === p.id) o.selected = true;
    ps.appendChild(o);
  });
  if (state.currentProjectId && !task) ps.value = state.currentProjectId;

  const ls = $('task-label-input');
  ls.innerHTML = '<option value="">— None —</option>';
  state.labels.forEach(l => {
    const o = el('option', '', '#' + escapeHtml(l.name));
    o.value = l.id;
    if (task?.labelId === l.id) o.selected = true;
    ls.appendChild(o);
  });

  openModal('task-modal-overlay');
  setTimeout(() => $('task-title-input').focus(), 80);
}

document.querySelectorAll('.priority-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.priority-btn').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-pressed','false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-pressed','true');
    state.taskModal.priority = parseInt(btn.dataset.priority);
  };
});

$('btn-add-task').onclick      = () => openTaskModal();
$('quick-add-trigger').onclick = () => openTaskModal();
$('quick-add-trigger').onkeydown = e => e.key === 'Enter' && openTaskModal();
$('quick-add-today').onclick   = () => { openTaskModal(); setTimeout(() => $('task-date-input').value = toDateStr(new Date()), 50); };
$('quick-add-today').onkeydown = e => e.key === 'Enter' && $('quick-add-today').click();
$('quick-add-project').onclick = () => openTaskModal();
$('quick-add-project').onkeydown = e => e.key === 'Enter' && openTaskModal();
$('task-modal-close').onclick  = () => closeModal('task-modal-overlay');
$('task-modal-cancel').onclick = () => closeModal('task-modal-overlay');

$('task-modal-save').onclick = async () => {
  const title = $('task-title-input').value.trim();
  if (!title) { toast('Enter a task title'); $('task-title-input').focus(); return; }

  const taskData = {
    title,
    desc:      $('task-desc-input').value.trim(),
    dueDate:   $('task-date-input').value,
    dueTime:   $('task-time-input').value,
    priority:  state.taskModal.priority,
    projectId: $('task-project-input').value,
    labelId:   $('task-label-input').value,
    recurring: $('task-recurring-input').value,
    done: false,
    subtasks: []
  };

  if (state.editingTaskId) {
    await fbUpdateTask(state.editingTaskId, taskData);
    toast('Task updated');
  } else {
    const task = { ...taskData, id: uid(), createdAt: Date.now() };
    await fbAddTask(task);
    if (state.currentView === 'today' && !taskData.dueDate) {
      await fbUpdateTask(task.id, { dueDate: toDateStr(new Date()) });
    }
    toast('Task added');
  }
  closeModal('task-modal-overlay');
  renderAll();
};

// ─── TASK RENDERING ───────────────────────────────────────────────────────────
function sortTasks(tasks) {
  const s = state.settings.sort;
  return [...tasks].sort((a, b) => {
    if (s === 'priority') return (a.priority || 4) - (b.priority || 4);
    if (s === 'due') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    }
    if (s === 'alpha') return a.title.localeCompare(b.title);
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

function renderTaskList(container, tasks, emptyMsg = 'No tasks here') {
  if (!container) return;
  if (!tasks.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon" aria-hidden="true">✓</div><div class="empty-title">${escapeHtml(emptyMsg)}</div><div class="empty-desc">You're all caught up.</div></div>`;
    return;
  }
  container.innerHTML = '';
  sortTasks(tasks).forEach(task => container.appendChild(createTaskEl(task)));
}

// FIX 3: Replace meta.innerHTML += ... for subtask count with safe DOM creation.
function createTaskEl(task) {
  const item = el('div', `task-item${task.done ? ' completed' : ''}${task.id === state.selectedTaskId ? ' selected' : ''}`);
  item.dataset.id = task.id;
  item.setAttribute('role', 'listitem');

  if ((task.priority || 4) < 4) {
    item.appendChild(el('div', `task-priority-dot priority-${task.priority}`));
  }

  const cb = el('div', `task-checkbox${task.done ? ' checked' : ''} p${task.priority || 4}`);
  cb.setAttribute('role', 'checkbox');
  cb.setAttribute('aria-checked', task.done ? 'true' : 'false');
  cb.setAttribute('aria-label', task.done ? 'Mark incomplete' : 'Mark complete');
  cb.tabIndex = 0;
  cb.onclick  = e => { e.stopPropagation(); toggleTask(task.id); };
  cb.onkeydown= e => e.key === ' ' && (e.preventDefault(), toggleTask(task.id));
  item.appendChild(cb);

  const body    = el('div', 'task-body');
  const titleEl = el('div', 'task-title', escapeHtml(task.title));
  body.appendChild(titleEl);

  const meta = el('div', 'task-meta');

  if (task.dueDate) {
    const cls    = isOverdue(task.dueDate) && !task.done ? ' overdue' : isToday(task.dueDate) ? ' today' : '';
    const dateEl = el('span', `task-date${cls}`);
    // Safe: SVG and date text are trusted/escaped; built via template only once here.
    dateEl.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${formatDate(task.dueDate)}${task.dueTime ? ' ' + formatTime(task.dueTime) : ''}${task.recurring ? ' 🔁' : ''}`;
    meta.appendChild(dateEl);
  }

  if (task.labelId) {
    const label = state.labels.find(l => l.id === task.labelId);
    if (label) {
      const lbl = el('span', 'task-label', '#' + escapeHtml(label.name));
      lbl.style.color = label.color;
      meta.appendChild(lbl);
    }
  }

  // FIX 3: subtask count built with DOM instead of innerHTML +=
  if (task.subtasks?.length) {
    const doneCount = task.subtasks.filter(s => s.done).length;
    const subSpan   = el('span', 'subtask-count');
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '10'); icon.setAttribute('height', '10');
    icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor'); icon.setAttribute('stroke-width', '2');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>';
    subSpan.appendChild(icon);
    subSpan.appendChild(document.createTextNode(`${doneCount}/${task.subtasks.length}`));
    meta.appendChild(subSpan);
  }

  if (meta.children.length) body.appendChild(meta);
  item.appendChild(body);

  const actions = el('div', 'task-actions');
  const editBtn = el('button', 'icon-btn');
  editBtn.title = 'Edit task';
  editBtn.setAttribute('aria-label', `Edit: ${task.title}`);
  editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  editBtn.onclick = e => { e.stopPropagation(); openTaskModal(task); };

  const delBtn = el('button', 'icon-btn');
  delBtn.title = 'Delete task';
  delBtn.setAttribute('aria-label', `Delete: ${task.title}`);
  delBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
  delBtn.style.color = 'var(--primary)';
  delBtn.onclick = e => { e.stopPropagation(); deleteTask(task.id); };
  actions.append(editBtn, delBtn);
  item.appendChild(actions);

  item.onclick = () => openDetail(task.id);
  return item;
}

async function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  const done = !task.done;
  const cbEl = document.querySelector(`.task-item[data-id="${id}"] .task-checkbox`);
  if (cbEl) { cbEl.classList.toggle('checked', done); cbEl.setAttribute('aria-checked', String(done)); }
  if (done && task.recurring) {
    await fbUpdateTask(id, { done: false, dueDate: getNextRecurring(task.dueDate, task.recurring) });
    toast('Recurring task rescheduled');
    return;
  }
  await fbUpdateTask(id, { done });
  if (done) toast('Task completed ✓');
}

function getNextRecurring(dateStr, recurring) {
  const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  if (recurring === 'daily')    d.setDate(d.getDate() + 1);
  else if (recurring === 'weekly')   d.setDate(d.getDate() + 7);
  else if (recurring === 'monthly')  d.setMonth(d.getMonth() + 1);
  else if (recurring === 'weekdays') { do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6); }
  return toDateStr(d);
}

async function deleteTask(id) {
  if (state.selectedTaskId === id) closeDetail();
  await fbDeleteTask(id);
  toast('Task deleted');
}

// ─── TASK DETAIL PANEL ────────────────────────────────────────────────────────
function openDetail(taskId) {
  state.selectedTaskId = taskId;
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  $('detail-panel').classList.add('open');
  const body    = $('detail-body');
  const project = state.projects.find(p => p.id === task.projectId);
  const label   = state.labels.find(l => l.id === task.labelId);
  body.innerHTML = '';

  const titleInput = el('textarea', 'detail-title-input');
  titleInput.value = task.title;
  titleInput.rows  = 2;
  titleInput.setAttribute('aria-label', 'Task title');
  titleInput.onblur = () => {
    const v = titleInput.value.trim();
    if (v && v !== task.title) fbUpdateTask(task.id, { title: v });
  };
  body.appendChild(titleInput);

  body.appendChild(el('div', 'detail-label', 'Description'));
  const descInput = el('textarea', 'detail-desc-input');
  descInput.value       = task.desc || '';
  descInput.placeholder = 'Add a description…';
  descInput.setAttribute('aria-label', 'Task description');
  descInput.onblur = () => { if (descInput.value !== task.desc) fbUpdateTask(task.id, { desc: descInput.value }); };
  body.appendChild(descInput);

  const metaSection = el('div', 'detail-section');

  const dateRow = el('div', 'detail-meta-row');
  const calIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
  dateRow.innerHTML = `${calIcon}<span class="detail-meta-label">Due date</span>`;
  const dateInput = document.createElement('input');
  dateInput.type  = 'date';
  dateInput.value = task.dueDate || '';
  dateInput.style.cssText = 'border:none;background:none;font-size:13px;font-weight:500;color:var(--text);text-align:right;cursor:pointer;outline:none';
  dateInput.onchange = () => fbUpdateTask(task.id, { dueDate: dateInput.value });
  dateRow.appendChild(dateInput);
  metaSection.appendChild(dateRow);

  const prioColors = { 1:'var(--priority-1)', 2:'var(--priority-2)', 3:'var(--priority-3)', 4:'var(--text-muted)' };
  const prioLabels = { 1:'Priority 1', 2:'Priority 2', 3:'Priority 3', 4:'No priority' };
  const prioIcon   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="4 15 4 4 20 4 20 15"/><line x1="4" y1="19" x2="4" y2="19"/><line x1="20" y1="19" x2="20" y2="19"/></svg>`;
  const prioRow = el('div', 'detail-meta-row');
  prioRow.innerHTML = `${prioIcon}<span class="detail-meta-label">Priority</span><span class="detail-meta-value" style="color:${prioColors[task.priority||4]}">${prioLabels[task.priority||4]}</span>`;
  metaSection.appendChild(prioRow);

  if (project) {
    const projRow = el('div', 'detail-meta-row');
    const dot = el('span');
    dot.style.cssText = `background:${project.color};width:10px;height:10px;border-radius:2px;flex-shrink:0`;
    projRow.innerHTML = `<span class="detail-meta-label" style="margin-left:22px">Project</span><span class="detail-meta-value">${escapeHtml(project.name)}</span>`;
    projRow.prepend(dot);
    metaSection.appendChild(projRow);
  }
  if (label) {
    const lRow = el('div', 'detail-meta-row');
    lRow.innerHTML = `<span style="font-size:14px">🏷️</span><span class="detail-meta-label">Label</span><span class="detail-meta-value">#${escapeHtml(label.name)}</span>`;
    metaSection.appendChild(lRow);
  }
  if (task.recurring) {
    const rRow = el('div', 'detail-meta-row');
    rRow.innerHTML = `<span style="font-size:14px">🔁</span><span class="detail-meta-label">Recurring</span><span class="detail-meta-value">${escapeHtml(task.recurring)}</span>`;
    metaSection.appendChild(rRow);
  }
  body.appendChild(metaSection);

  const subSection = el('div', 'detail-section');
  subSection.appendChild(el('div', 'detail-label', 'Subtasks'));
  const subList = el('div');
  (task.subtasks || []).forEach(sub => {
    const row = el('div', 'subtask-item');
    const cb  = el('div', `task-checkbox${sub.done ? ' checked' : ''}`);
    cb.style.cssText = 'width:14px;height:14px;flex-shrink:0';
    cb.setAttribute('role','checkbox');
    cb.setAttribute('aria-checked', String(sub.done));
    cb.onclick = () => { sub.done = !sub.done; fbUpdateTask(task.id, { subtasks: task.subtasks }); openDetail(taskId); };
    const inp = document.createElement('input');
    inp.type  = 'text';
    inp.value = sub.title;
    inp.setAttribute('aria-label', 'Subtask title');
    if (sub.done) inp.style.textDecoration = 'line-through';
    inp.style.cssText = 'flex:1;border:none;background:none;font-size:13px;color:var(--text);outline:none';
    inp.onblur = () => { sub.title = inp.value; fbUpdateTask(task.id, { subtasks: task.subtasks }); };
    row.append(cb, inp);
    subList.appendChild(row);
  });

  const addSub = el('div', 'subtask-add');
  addSub.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add subtask`;
  addSub.onclick = () => {
    const inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = 'Subtask title…';
    inp.style.cssText = 'width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:13px;margin-top:6px';
    inp.onkeydown = e => {
      if (e.key === 'Enter' && inp.value.trim()) {
        if (!task.subtasks) task.subtasks = [];
        task.subtasks.push({ id: uid(), title: inp.value.trim(), done: false });
        fbUpdateTask(task.id, { subtasks: task.subtasks });
        openDetail(taskId);
      }
      if (e.key === 'Escape') inp.remove();
    };
    addSub.after(inp);
    inp.focus();
  };
  subSection.append(subList, addSub);
  body.appendChild(subSection);

  const delBtn = el('button', 'btn btn-danger btn-sm');
  delBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg> Delete task`;
  delBtn.style.marginTop = '16px';
  delBtn.onclick = () => { deleteTask(task.id); closeDetail(); };
  body.appendChild(delBtn);

  document.querySelectorAll('.task-item').forEach(e => e.classList.toggle('selected', e.dataset.id === taskId));
}

function closeDetail() {
  state.selectedTaskId = null;
  $('detail-panel').classList.remove('open');
  document.querySelectorAll('.task-item.selected').forEach(e => e.classList.remove('selected'));
}
$('btn-close-detail').onclick = closeDetail;

// ─── RENDER ALL ───────────────────────────────────────────────────────────────
function renderAll() {
  renderTaskViews();
  renderProjectsNav();
  renderLabelsNav();
  updateCounts();
  if (state.currentView === 'productivity') renderProductivity();
  if (state.currentView === 'calendar')     renderCalendar();
  if (state.currentView === 'notes')        renderNotesList();
  if (state.selectedTaskId)                 openDetail(state.selectedTaskId);
}

function renderTaskViews() {
  const today = toDateStr(new Date());

  const todaySub = $('today-date-subtitle');
  if (todaySub) todaySub.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  const active         = state.tasks.filter(t => !t.done);
  const inboxTasks     = active.filter(t => !t.projectId && !t.dueDate);
  const todayTasks     = active.filter(t => t.dueDate === today);
  const overdueTasks   = active.filter(t => t.dueDate && t.dueDate < today);
  const somedayTasks   = active.filter(t => !t.dueDate);
  const completedTasks = state.tasks.filter(t => t.done);

  renderTaskList($('task-list-inbox'),     inboxTasks,                'Inbox is empty');
  renderTaskList($('task-list-today'),     todayTasks,                'Nothing due today');
  renderTaskList($('task-list-overdue'),   overdueTasks,              'No overdue tasks');
  renderTaskList($('task-list-completed'), completedTasks.slice(0,50),'No completed tasks');
  renderTaskList($('task-list-someday'),   somedayTasks,              'No tasks in Someday');

  const upcomingEl = $('task-list-upcoming');
  if (upcomingEl) {
    upcomingEl.innerHTML = '';
    const future = active.filter(t => t.dueDate && t.dueDate >= today).sort((a,b) => a.dueDate < b.dueDate ? -1 : 1);
    if (!future.length) {
      upcomingEl.innerHTML = `<div class="empty-state"><div class="empty-icon" aria-hidden="true">📅</div><div class="empty-title">Nothing upcoming</div><div class="empty-desc">Add tasks with future dates to see them here.</div></div>`;
    } else {
      const groups = {};
      future.forEach(t => { (groups[t.dueDate] = groups[t.dueDate] || []).push(t); });
      Object.entries(groups).slice(0,14).forEach(([date, tasks]) => {
        const section  = el('div', 'task-section');
        const d        = new Date(date + 'T00:00:00');
        const dayLabel = date === today ? 'Today' : d.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
        section.innerHTML = `<div class="task-section-title">${escapeHtml(dayLabel)}</div>`;
        tasks.forEach(t => section.appendChild(createTaskEl(t)));
        upcomingEl.appendChild(section);
      });
    }
  }

  if (state.currentView === 'project') renderProjectView();
  if (state.currentView === 'label')   renderLabelView();
}

function renderProjectView() {
  renderTaskList($('task-list-project'),
    state.tasks.filter(t => t.projectId === state.currentProjectId && !t.done),
    'No tasks in this project');
}
function renderLabelView() {
  renderTaskList($('task-list-label'),
    state.tasks.filter(t => t.labelId === state.currentLabelId && !t.done),
    'No tasks with this label');
}

function updateCounts() {
  const today  = toDateStr(new Date());
  const active = state.tasks.filter(t => !t.done);
  $('count-inbox').textContent   = active.filter(t => !t.projectId && !t.dueDate).length;
  $('count-today').textContent   = active.filter(t => t.dueDate === today).length;
  $('count-overdue').textContent = active.filter(t => t.dueDate && t.dueDate < today).length;
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────

// FIX 5: Shared helper — opens detail and closes the panel on mobile first so
// the detail panel is visible. Used by all three calendar render functions.
function calOpenDetail(taskId) {
  if (window.innerWidth < 768) {
    $('sidebar').classList.remove('mobile-open');
  }
  openDetail(taskId);
}

function renderCalendar() {
  const d = state.calDate;
  document.querySelectorAll('.cal-view-tab').forEach(t => t.classList.toggle('active', t.dataset.calView === state.calView));

  if      (state.calView === 'month')  { $('cal-title').textContent = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; renderMonthView(d); }
  else if (state.calView === 'week')   {
    const start = new Date(d); start.setDate(d.getDate() - d.getDay());
    const end   = new Date(start); end.setDate(start.getDate() + 6);
    $('cal-title').textContent = `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
    renderWeekView(start);
  }
  else if (state.calView === 'day')    { $('cal-title').textContent = d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }); renderDayView(d); }
  else                                  { $('cal-title').textContent = 'Agenda'; renderAgendaView(); }
}

// FIX 5: Use calOpenDetail() instead of openDetail() for calendar event clicks.
function renderMonthView(date) {
  const body     = $('cal-body');
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay  = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const today    = toDateStr(new Date());

  let html = `<div class="cal-month-grid">`;
  DAYS_S.forEach(d => html += `<div class="cal-day-header">${d}</div>`);

  for (let i = 0; i < firstDay.getDay(); i++) {
    const prev = new Date(firstDay); prev.setDate(prev.getDate() - (firstDay.getDay() - i));
    html += `<div class="cal-day other-month"><div class="cal-day-num">${prev.getDate()}</div></div>`;
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr  = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isT      = dateStr === today;
    const dayTasks = state.tasks.filter(t => t.dueDate === dateStr && !t.done);
    const doneCount= state.tasks.filter(t => t.dueDate === dateStr &&  t.done).length;
    html += `<div class="cal-day${isT ? ' today' : ''}" data-date="${dateStr}">`;
    html += `<div class="cal-day-num">${d}</div>`;
    dayTasks.slice(0,3).forEach(t => {
      html += `<div class="cal-event priority-${t.priority||4}" data-id="${t.id}" title="${escapeHtml(t.title)}">${escapeHtml(t.title)}</div>`;
    });
    if (dayTasks.length > 3) html += `<div style="font-size:10px;color:var(--text-muted);padding:1px 3px">+${dayTasks.length - 3} more</div>`;
    if (doneCount) html += `<div class="cal-event completed" aria-label="${doneCount} completed">✓ ${doneCount} done</div>`;
    html += `</div>`;
  }
  const remaining = 7 - ((firstDay.getDay() + lastDay.getDate()) % 7);
  if (remaining < 7) for (let i = 1; i <= remaining; i++) html += `<div class="cal-day other-month"><div class="cal-day-num">${i}</div></div>`;
  html += '</div>';
  body.innerHTML = html;

  body.querySelectorAll('.cal-event[data-id]').forEach(e => {
    e.onclick = ev => { ev.stopPropagation(); const t = state.tasks.find(t => t.id === e.dataset.id); if (t) calOpenDetail(t.id); };
  });
  body.querySelectorAll('.cal-day:not(.other-month)').forEach(d => {
    d.onclick = () => { openTaskModal(); setTimeout(() => $('task-date-input').value = d.dataset.date, 50); };
  });
}

// FIX 5: Use calOpenDetail() instead of openDetail() for calendar event clicks.
function renderWeekView(startDate) {
  const body  = $('cal-body');
  const today = toDateStr(new Date());
  const hours = Array.from({length:24}, (_,i) => i);
  let html = `<div class="cal-week-grid">`;
  html += `<div class="cal-time-gutter">`;
  hours.forEach(h => html += `<div class="cal-time-slot">${h === 0 ? '' : h < 12 ? h+'am' : h === 12 ? '12pm' : (h-12)+'pm'}</div>`);
  html += `</div>`;
  for (let i = 0; i < 7; i++) {
    const d       = new Date(startDate); d.setDate(startDate.getDate() + i);
    const dateStr = toDateStr(d);
    const isToday = dateStr === today;
    html += `<div class="cal-week-col">`;
    html += `<div class="cal-week-col-header${isToday ? ' today-col' : ''}"><span class="day-name">${DAYS_S[d.getDay()]}</span><span class="cal-day-num day-num">${d.getDate()}</span></div>`;
    hours.forEach(h => {
      const tasks = state.tasks.filter(t => t.dueDate === dateStr && t.dueTime && parseInt(t.dueTime.split(':')[0]) === h && !t.done);
      html += `<div class="cal-hour-cell" data-date="${dateStr}" data-hour="${h}">`;
      tasks.forEach(t => html += `<div class="cal-event" data-id="${t.id}" style="margin:2px">${escapeHtml(t.title)}</div>`);
      html += `</div>`;
    });
    html += `</div>`;
  }
  html += '</div>';
  body.innerHTML = html;
  body.querySelectorAll('.cal-event[data-id]').forEach(e => {
    e.onclick = ev => { ev.stopPropagation(); const t = state.tasks.find(t => t.id === e.dataset.id); if (t) calOpenDetail(t.id); };
  });
  body.querySelectorAll('.cal-hour-cell').forEach(cell => {
    cell.onclick = () => { openTaskModal(); setTimeout(() => { $('task-date-input').value = cell.dataset.date; $('task-time-input').value = String(cell.dataset.hour).padStart(2,'0') + ':00'; }, 50); };
  });
}

// FIX 5: Use calOpenDetail() instead of openDetail() for calendar event clicks.
function renderDayView(date) {
  const body    = $('cal-body');
  const dateStr = toDateStr(date);
  const dayTasks= state.tasks.filter(t => t.dueDate === dateStr && !t.done);
  const hours   = Array.from({length:24}, (_,i) => i);
  let html = `<div style="display:grid;grid-template-columns:60px 1fr;overflow:auto;flex:1">`;
  html += `<div>`;
  hours.forEach(h => html += `<div class="cal-time-slot" style="height:60px">${h === 0 ? '' : h < 12 ? h+'am' : h === 12 ? '12pm' : (h-12)+'pm'}</div>`);
  html += `</div><div style="border-left:1px solid var(--border)">`;
  hours.forEach(h => {
    const tasks = dayTasks.filter(t => t.dueTime && parseInt(t.dueTime.split(':')[0]) === h);
    html += `<div class="cal-hour-cell" data-date="${dateStr}" data-hour="${h}" style="height:60px">`;
    tasks.forEach(t => html += `<div class="cal-event" data-id="${t.id}" style="margin:2px">${escapeHtml(t.title)}</div>`);
    html += `</div>`;
  });
  html += `</div></div>`;
  body.innerHTML = html;
  body.querySelectorAll('.cal-event[data-id]').forEach(e => {
    e.onclick = ev => { ev.stopPropagation(); const t = state.tasks.find(t => t.id === e.dataset.id); if (t) calOpenDetail(t.id); };
  });
}

function renderAgendaView() {
  const body    = $('cal-body');
  const today   = toDateStr(new Date());
  const upcoming= state.tasks.filter(t => t.dueDate && t.dueDate >= today && !t.done)
    .sort((a,b) => a.dueDate < b.dueDate ? -1 : 1);
  if (!upcoming.length) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon" aria-hidden="true">📅</div><div class="empty-title">Nothing upcoming</div></div>`;
    return;
  }
  const groups = {};
  upcoming.forEach(t => { (groups[t.dueDate] = groups[t.dueDate] || []).push(t); });
  let html = '<div style="padding:16px;max-width:600px;margin:0 auto">';
  Object.entries(groups).forEach(([date, tasks]) => {
    const d = new Date(date + 'T00:00:00');
    html += `<div style="margin-bottom:20px"><div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em">${d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</div>`;
    tasks.forEach(t => {
      html += `<div class="task-item" data-id="${t.id}" style="border:1px solid var(--border);border-radius:var(--radius);margin-bottom:4px">`;
      html += `<div class="task-checkbox${t.done?' checked':''} p${t.priority||4}" onclick="event.stopPropagation();toggleTask('${t.id}')" role="checkbox" aria-checked="${t.done}"></div>`;
      html += `<div class="task-body"><div class="task-title">${escapeHtml(t.title)}</div>`;
      if (t.dueTime) html += `<div class="task-date">${formatTime(t.dueTime)}</div>`;
      html += `</div></div>`;
    });
    html += `</div>`;
  });
  html += '</div>';
  body.innerHTML = html;
  body.querySelectorAll('.task-item[data-id]').forEach(item => {
    item.onclick = () => calOpenDetail(item.dataset.id);
  });
}

// Calendar nav
document.querySelectorAll('.cal-view-tab').forEach(tab => {
  tab.onclick  = () => { state.calView = tab.dataset.calView; renderCalendar(); };
  tab.onkeydown= e => e.key === 'Enter' && tab.click();
});
$('cal-prev').onclick = () => {
  const d = state.calDate;
  if      (state.calView === 'month') d.setMonth(d.getMonth() - 1);
  else if (state.calView === 'week')  d.setDate(d.getDate() - 7);
  else if (state.calView === 'day')   d.setDate(d.getDate() - 1);
  state.calDate = new Date(d); renderCalendar();
};
$('cal-next').onclick = () => {
  const d = state.calDate;
  if      (state.calView === 'month') d.setMonth(d.getMonth() + 1);
  else if (state.calView === 'week')  d.setDate(d.getDate() + 7);
  else if (state.calView === 'day')   d.setDate(d.getDate() + 1);
  state.calDate = new Date(d); renderCalendar();
};
$('cal-today-btn').onclick = () => { state.calDate = new Date(); renderCalendar(); };

// ─── NOTES ────────────────────────────────────────────────────────────────────
let noteAutoSaveTimer = null;

function renderNotesList() {
  const scroll = $('notes-list-scroll');
  if (!scroll) return;
  const q     = $('note-search-input')?.value.toLowerCase() || '';
  const notes = state.notes
    .filter(n => !q || n.title.toLowerCase().includes(q) || (n.content||'').replace(/<[^>]+>/g,'').toLowerCase().includes(q))
    .sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0));
  scroll.innerHTML = '';
  if (!notes.length) {
    scroll.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">No notes found</div>`;
    return;
  }
  notes.forEach(note => {
    const item      = el('div', `note-list-item${note.id === state.selectedNoteId ? ' active' : ''}`);
    const plainText = (note.content || '').replace(/<[^>]+>/g,'').trim();
    item.innerHTML  = `<div class="note-item-title">${escapeHtml(note.title || 'Untitled')}</div><div class="note-item-preview">${escapeHtml(plainText.slice(0,60)) || 'No content'}</div><div class="note-item-date">${new Date(note.updatedAt||0).toLocaleDateString()}</div>`;
    item.setAttribute('role', 'listitem');
    item.onclick = () => openNote(note.id);
    scroll.appendChild(item);
  });
}

function openNote(id) {
  state.selectedNoteId = id;
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  $('note-empty-state').hidden   = true;
  $('note-editor-content').hidden= false;
  $('note-title-input').value    = note.title   || '';
  $('note-editor').innerHTML     = note.content || '';
  $('note-save-status').textContent = 'Saved';
  renderNotesList();
}

$('btn-add-note').onclick = async () => {
  const note = { id: uid(), title: 'Untitled note', content: '', updatedAt: Date.now() };
  await fbAddNote(note);
  openNote(note.id);
};

$('btn-delete-note').onclick = async () => {
  if (!state.selectedNoteId) return;
  await fbDeleteNote(state.selectedNoteId);
  state.selectedNoteId = null;
  $('note-empty-state').hidden   = false;
  $('note-editor-content').hidden= true;
  renderNotesList();
  toast('Note deleted');
};

// FIX 4: After persisting title/content to local state, call renderNotesList()
// so the sidebar preview reflects the latest changes immediately.
function noteAutoSave() {
  clearTimeout(noteAutoSaveTimer);
  $('note-save-status').textContent = 'Saving…';
  noteAutoSaveTimer = setTimeout(async () => {
    if (!state.selectedNoteId) return;
    const title   = $('note-title-input').value.trim() || 'Untitled';
    const content = $('note-editor').innerHTML;
    const updatedAt = Date.now();
    // Optimistically update local state first so the sidebar preview is immediate.
    const note = state.notes.find(n => n.id === state.selectedNoteId);
    if (note) {
      note.title     = title;
      note.content   = content;
      note.updatedAt = updatedAt;
      renderNotesList();
    }
    try {
      await fbUpdateNote(state.selectedNoteId, { title, content, updatedAt });
      $('note-save-status').textContent = 'Saved';
    } catch (err) {
      console.error('[Flow] Note save failed:', err);
      $('note-save-status').textContent = 'Save failed';
      toast('Could not save note. Check your connection.');
    }
  }, 1000);
}

$('note-title-input').addEventListener('input', noteAutoSave);
$('note-editor').addEventListener('input', noteAutoSave);
$('note-search-input')?.addEventListener('input', renderNotesList);

// Formatting toolbar
document.querySelectorAll('.note-tool-btn').forEach(btn => {
  btn.onclick = () => {
    const cmd = btn.dataset.cmd;
    const cmds = { bold:'bold', italic:'italic', underline:'underline',
      h1:null, h2:null, h3:null, ul:'insertUnorderedList', ol:'insertOrderedList', code:null };
    if      (cmd === 'link')                    { const url = prompt('Enter URL:'); if (url) document.execCommand('createLink', false, url); }
    else if (['h1','h2','h3'].includes(cmd))    document.execCommand('formatBlock', false, cmd);
    else if (cmd === 'code')                    document.execCommand('formatBlock', false, 'pre');
    else if (cmd === 'checklist')               document.execCommand('insertHTML', false, '<ul style="list-style:none;padding-left:0"><li><label><input type="checkbox"> </label></li></ul>');
    else if (cmds[cmd])                         document.execCommand(cmds[cmd]);
    $('note-editor').focus();
    noteAutoSave();
  };
});

// ─── PRODUCTIVITY DASHBOARD ───────────────────────────────────────────────────
function renderProductivity() {
  const today          = toDateStr(new Date());
  const completedToday = state.tasks.filter(t => t.done && t.dueDate === today).length;
  const activeCount    = state.tasks.filter(t => !t.done).length;
  const goal           = state.settings.dailyGoal || 5;
  const pct            = Math.min(100, Math.round((completedToday / goal) * 100));

  const statsGrid = $('stats-grid');
  if (statsGrid) {
    statsGrid.innerHTML = `
      <div class="stat-card" role="listitem"><div class="stat-icon" aria-hidden="true">✅</div><div class="stat-value">${completedToday}</div><div class="stat-label">Completed today</div></div>
      <div class="stat-card" role="listitem"><div class="stat-icon" aria-hidden="true">📋</div><div class="stat-value">${activeCount}</div><div class="stat-label">Active tasks</div></div>
      <div class="stat-card" role="listitem"><div class="stat-icon" aria-hidden="true">📁</div><div class="stat-value">${state.projects.length}</div><div class="stat-label">Projects</div></div>
      <div class="stat-card" role="listitem"><div class="stat-icon" aria-hidden="true">📝</div><div class="stat-value">${state.notes.length}</div><div class="stat-label">Notes</div></div>
    `;
  }
  const goalText    = $('daily-goal-text');
  const goalFill    = $('daily-goal-fill');
  const goalPct     = $('daily-pct');
  const progressBar = $('daily-progress-bar');
  if (goalText) goalText.textContent = `${completedToday} / ${goal} tasks completed`;
  if (goalFill) { goalFill.style.width = pct + '%'; goalFill.classList.toggle('success', pct >= 100); }
  if (goalPct)  { goalPct.textContent = pct + '%'; goalPct.style.color = pct >= 100 ? 'var(--success)' : 'var(--primary)'; }
  if (progressBar) progressBar.setAttribute('aria-valuenow', pct);

  const chart  = $('week-chart');
  const labels = $('week-chart-labels');
  if (chart) {
    const days  = Array.from({length:7}, (_,i) => { const d = new Date(); d.setDate(d.getDate() - (6-i)); return toDateStr(d); });
    const counts= days.map(d => state.tasks.filter(t => t.done && t.dueDate === d).length);
    const max   = Math.max(...counts, 1);
    chart.innerHTML = counts.map((c,i) => {
      const h       = Math.max(4, Math.round((c/max)*70));
      const isToday = days[i] === today;
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${c}</div>
        <div style="width:100%;height:${h}px;background:${isToday?'var(--primary)':'var(--bg-tertiary)'};border-radius:4px;transition:height 0.4s ease"></div>
      </div>`;
    }).join('');
    if (labels) {
      labels.innerHTML = days.map(d => {
        const dn = new Date(d + 'T00:00:00');
        return `<div style="flex:1;text-align:center;font-size:11px;color:var(--text-muted)">${DAYS_XS[dn.getDay()]}</div>`;
      }).join('');
    }
  }
}

// ─── POMODORO ─────────────────────────────────────────────────────────────────
function updatePomodoroDisplay() {
  const p = state.pomodoro;
  const m = Math.floor(p.remaining / 60);
  const s = p.remaining % 60;
  $('pomodoro-display').textContent    = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  $('pomodoro-mode-label').textContent = p.mode === 'work' ? 'Focus session' : p.mode === 'shortBreak' ? 'Short break' : 'Long break';
  $('pomodoro-session').textContent    = p.session;
  $('pomodoro-start').textContent      = p.running ? 'Pause' : 'Start';
  document.title = p.running ? `${$('pomodoro-display').textContent} — Flow` : 'Flow — Tasks, Calendar & Notes';
}

$('pomodoro-start').onclick = () => {
  const p = state.pomodoro;
  if (p.running) {
    clearInterval(p.timer);
    p.running = false;
  } else {
    p.running = true;
    p.timer   = setInterval(() => {
      p.remaining--;
      if (p.remaining <= 0) {
        clearInterval(p.timer);
        p.running = false;
        if (p.mode === 'work') {
          p.session++;
          p.mode      = p.session % 4 === 0 ? 'longBreak' : 'shortBreak';
          p.remaining = p.mode === 'longBreak' ? p.longBreak : p.shortBreak;
          toast('Focus session complete! Take a break. 🎉');
        } else {
          p.mode      = 'work';
          p.remaining = p.work;
          toast('Break over. Back to focus! 💪');
        }
      }
      updatePomodoroDisplay();
    }, 1000);
  }
  updatePomodoroDisplay();
};
$('pomodoro-reset').onclick = () => {
  const p = state.pomodoro;
  clearInterval(p.timer);
  p.running = false; p.remaining = p.work; p.mode = 'work'; p.session = 1;
  updatePomodoroDisplay();
};
$('pomodoro-skip').onclick = () => {
  const p = state.pomodoro;
  clearInterval(p.timer); p.running = false;
  if (p.mode === 'work') { p.session++; p.mode = 'shortBreak'; p.remaining = p.shortBreak; }
  else                    { p.mode = 'work'; p.remaining = p.work; }
  updatePomodoroDisplay();
};

// ─── SEARCH ───────────────────────────────────────────────────────────────────
let searchTimer = null;
$('search-input').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => renderSearchResults(e.target.value.trim()), 150);
});
$('search-input').addEventListener('focus', e => { if (e.target.value) renderSearchResults(e.target.value); });
document.addEventListener('click', e => {
  if (!e.target.closest('#search-bar') && !e.target.closest('#search-results'))
    $('search-results').classList.remove('visible');
});

function renderSearchResults(query) {
  const results = $('search-results');
  if (!query) { results.classList.remove('visible'); return; }
  const q = query.toLowerCase();

  const taskMatches    = state.tasks.filter(t => t.title.toLowerCase().includes(q) || (t.desc||'').toLowerCase().includes(q)).slice(0,5);
  const noteMatches    = state.notes.filter(n => n.title.toLowerCase().includes(q) || (n.content||'').replace(/<[^>]+>/g,'').toLowerCase().includes(q)).slice(0,3);
  const projectMatches = state.projects.filter(p => p.name.toLowerCase().includes(q)).slice(0,2);

  if (!taskMatches.length && !noteMatches.length && !projectMatches.length) {
    results.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px">No results for "${escapeHtml(query)}"</div>`;
  } else {
    results.innerHTML = '';
    const addResult = (typeLabel, title, sub, onclick) => {
      const item = el('div', 'search-result-item');
      item.setAttribute('role','option');
      item.innerHTML = `<span class="search-result-type">${typeLabel}</span><span class="search-result-title">${escapeHtml(title)}</span>${sub ? `<span class="search-result-sub">${escapeHtml(sub)}</span>` : ''}`;
      item.onclick = onclick;
      results.appendChild(item);
    };
    taskMatches.forEach(t    => addResult('Task',    t.title,          t.dueDate ? formatDate(t.dueDate) : '', () => { openDetail(t.id); clearSearch(); }));
    noteMatches.forEach(n    => addResult('Note',    n.title||'Untitled', '',                                  () => { navigate('notes'); setTimeout(() => openNote(n.id), 100); clearSearch(); }));
    projectMatches.forEach(p => addResult('Project', p.name,           '',                                     () => { navigate('project', { projectId: p.id }); clearSearch(); }));
  }
  results.classList.add('visible');
}
function clearSearch() {
  $('search-results').classList.remove('visible');
  $('search-input').value = '';
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function openModal(id) {
  const overlay = $(id);
  overlay.classList.add('open');
  // Lock body scroll so background content doesn't scroll behind modal on mobile
  document.body.classList.add('modal-open');
  // Hide app from screen readers while modal is open
  $('app')?.setAttribute('aria-hidden', 'true');
  overlay.onclick = e => { if (e.target === overlay) closeModal(id); };
}
function closeModal(id) {
  $(id).classList.remove('open');
  // Only unlock scroll if no other modals are still open
  const anyOpen = document.querySelector('.modal-overlay.open');
  if (!anyOpen) {
    document.body.classList.remove('modal-open');
    $('app')?.removeAttribute('aria-hidden');
  }
}

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────────────────
let gKeyPending = false;
document.addEventListener('keydown', e => {
  const isInput = ['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName) || e.target.isContentEditable;

  if (e.key === 'Escape') {
    closeModal('task-modal-overlay');
    closeModal('project-modal-overlay');
    closeModal('label-modal-overlay');
    closeModal('profile-modal-overlay');
    closeDetail();
    $('search-results').classList.remove('visible');
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    $('search-input').focus();
    return;
  }
  if (isInput) return;

  if (e.key === 'q' || e.key === 'Q') { openTaskModal(); return; }
  if (e.key === 'd' || e.key === 'D') { state.settings.darkMode = !state.settings.darkMode; applySettings(); DB.save(); return; }
  if (e.key === 'f' || e.key === 'F') { document.body.classList.toggle('focus-mode'); return; }

  if (e.key === 'g' || e.key === 'G') { gKeyPending = true; setTimeout(() => gKeyPending = false, 1000); return; }
  if (gKeyPending) {
    const nav = { t:'today', i:'inbox', c:'calendar', n:'notes', u:'upcoming' };
    const target = nav[e.key.toLowerCase()];
    if (target) { navigate(target); gKeyPending = false; }
  }
});

// ─── MOBILE ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) {
    closeMobileSidebar();
    $('detail-panel')?.classList.remove('mobile-full');
  }
});

// Close mobile sidebar on nav item click
document.querySelectorAll('[data-view]').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth < 768) closeMobileSidebar();
  });
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  let firebaseAvailable = false;

  try {
    // Give the Firebase module script up to 20 s to resolve.
    // The module script is placed just before this file in the HTML,
    // so in practice it resolves in milliseconds — the timeout only
    // fires if the CDN is blocked or the config is rejected.
    await Promise.race([
      window._fbReady,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase load timeout after 20 s')), 20000)
      )
    ]);
    firebaseAvailable = isFirebaseReady();
    if (!firebaseAvailable) {
      // _fbReady resolved but _fb wasn't populated — should never happen
      console.error('[Flow] _fbReady resolved but window._fb is incomplete:', window._fb);
    }
  } catch (e) {
    console.warn('[Flow] Firebase unavailable:', e.message || e);
    console.info(
      '[Flow] Debug checklist:\n' +
      '  1. Open Firebase Console → Authentication → Settings → Authorized domains\n' +
      '     and add your domain (e.g. localhost, 127.0.0.1, or your production host).\n' +
      '  2. Open Firestore → Rules and confirm reads/writes are allowed for your uid.\n' +
      '  3. Check Network tab for failed requests to firestore.googleapis.com.\n' +
      '  4. Confirm no browser extension (uBlock, Privacy Badger) is blocking gstatic.com.'
    );
  }

  updateAuthUI(firebaseAvailable);

  if (firebaseAvailable && initFirebase()) {
    console.log('[Flow] Connected to Firebase — waiting for auth state.');
  } else {
    showAuth();
  }

  // Initialize encapsulated sidebar module (desktop collapse + Ctrl+B + localStorage)
  initSidebar();

  // Insert topbar page-title span before the search bar (idempotent).
  const tb = $('topbar');
  if (tb && !tb.querySelector('.topbar-title')) {
    const searchBar = $('search-bar');
    const titleEl   = el('span', 'topbar-title', 'Inbox');
    if (searchBar && searchBar.parentNode === tb) {
      tb.insertBefore(titleEl, searchBar);
    } else if (tb.children.length > 1) {
      tb.insertBefore(titleEl, tb.children[1]);
    } else {
      tb.appendChild(titleEl);
    }
  }

  updatePomodoroDisplay();
}

init();