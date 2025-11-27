// Tailwind-based Job Tracker PWA (Option C: bundled defaultJobs + default_jobs.json file)
const STORAGE_KEY = 'job-tracker.jobs.v1';

function uid(){ return 'id-'+Math.random().toString(36).slice(2,9) }
function nowTs(){ return new Date().toISOString() }

const bundledDefaultJobs = [
  {
    "companyName": "The Choice School (Tripunithura)",
    "jobTitle": "School Contact",
    "location": "Nadama East, Tripunithura",
    "contactEmail": "adminschool@choicegroup.in",
    "contactPhone": "",
    "notes": "https://choiceschool.com/contact-us/",
    "status": "Pending"
  },
  {
    "companyName": "Bhavan's Munshi Vidyashram (Thiruvamkulam)",
    "jobTitle": "School Contact",
    "location": "Thiruvamkulam, Tripunithura",
    "contactEmail": "bhavansthiruvamkulam@yahoo.co.in",
    "contactPhone": "",
    "notes": "https://www.bmvthiruvamkulam.ac.in/contact-us",
    "status": "Pending"
  },
  {
    "companyName": "Chinmaya Vidyalaya (Tripunithura)",
    "jobTitle": "School Contact",
    "location": "Kannankulangara, Tripunithura",
    "contactEmail": "chinmayavidyalayatripunithura@gmail.com",
    "contactPhone": "",
    "notes": "https://chinmayavidyalaya.edu.in/page?content=students",
    "status": "Pending"
  },
  {
    "companyName": "Sanskara School (Infopark/Phase II)",
    "jobTitle": "School Contact",
    "location": "Infopark/Phase II, Kochi",
    "contactEmail": "info@sanskaraschool.com",
    "contactPhone": "",
    "notes": "https://sanskaraschool.com/contact-us",
    "status": "Pending"
  },
  {
    "companyName": "Assisi Vidyaniketan Public School (Kakkanad)",
    "jobTitle": "School Contact",
    "location": "Chembumukku, Thrikkakara (Kakkanad)",
    "contactEmail": "assisipublic@assisi.ac.in",
    "contactPhone": "",
    "notes": "https://assisi.ac.in/",
    "status": "Pending"
  },
  {
    "companyName": "Rajagiri Seashore CMI School",
    "jobTitle": "School Contact",
    "location": "South Malippuram / near Tripunithura region",
    "contactEmail": "rajagiriseashore@gmail.com",
    "contactPhone": "",
    "notes": "https://rajagiriseashore.com/contact-us/",
    "status": "Pending"
  },
  {
    "companyName": "MGM Public School (Ernakulam)",
    "jobTitle": "School Contact",
    "location": "Ernakulam",
    "contactEmail": "mgmps@mgmedugroup.com",
    "contactPhone": "",
    "notes": "https://mgmschool.com/ernakulam/contact/",
    "status": "Pending"
  },
  {
    "companyName": "Gregorian Public School (Maradu)",
    "jobTitle": "School Contact",
    "location": "Maradu, Ernakulam",
    "contactEmail": "gregorianschool@gmail.com",
    "contactPhone": "",
    "notes": "https://www.gregorianpublicschool.org/general-information.html",
    "status": "Pending"
  },
  {
    "companyName": "Bhavans Vidya Mandir (Eroor / Kunnara PO)",
    "jobTitle": "School Contact",
    "location": "Eroor / Kunnara PO, Tripunithura area",
    "contactEmail": "nirmalavenkat20@gmail.com",
    "contactPhone": "",
    "notes": "https://www.thrissurkerala.com/school/cbse/ernakulam-cbse-school-codes-phone-numbers-email-address.html",
    "status": "Pending"
  },
  {
    "companyName": "Rajagiri (general contact) \u2014 note: campus/branches vary",
    "jobTitle": "School Contact",
    "location": "Kochi / Ernakulam region",
    "contactEmail": "info@rajagiri.org",
    "contactPhone": "",
    "notes": "https://rajagiri.org/",
    "status": "Pending"
  }
];

const state = { jobs: [] };

function load(){ 
  try{ const raw = localStorage.getItem(STORAGE_KEY); state.jobs = raw ? JSON.parse(raw) : []; }catch(e){ state.jobs = [] }
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.jobs)) }

function mergeJobs(arr){
  const key = j => ((j.companyName||'') + '||' + (j.jobTitle||'')).toLowerCase();
  const existingKeys = new Set(state.jobs.map(key));
  arr.forEach(item => {
    if(!item.id) item.id = uid();
    if(!existingKeys.has(key(item))){ state.jobs.unshift(item); existingKeys.add(key(item)); }
  });
  save();
}

function addOrUpdate(job){
  if(!job.id) job.id = uid();
  const existing = state.jobs.find(j=>j.id===job.id);
  if(existing){ Object.assign(existing, job); existing.updatedAt = nowTs(); }
  else { job.createdAt = job.createdAt || nowTs(); state.jobs.unshift(job); }
  save(); render();
}

function removeJob(id){ state.jobs = state.jobs.filter(j=>j.id!==id); save(); render(); }

// Elements
const cardsEl = document.getElementById('cards');
const tpl = document.getElementById('cardTpl');
const modal = document.getElementById('modal');
const jobForm = document.getElementById('jobForm');
const modalTitle = document.getElementById('modalTitle');
let editId = null;

// Helpers
function ensureHttp(url){ if(!url) return ''; return /^https?:\/\//i.test(url) ? url : ('https://' + url); }
function extractUrl(text){ const m = (text||'').match(/https?:\/\/[^\s]+/i); return m ? m[0] : ''; }

// Optional user profile (name/phone/email) from localStorage
const PROFILE_LS_KEY = 'job-tracker.profile.v1';
function getUserProfile(){
  try{
    const raw = localStorage.getItem(PROFILE_LS_KEY);
    if(!raw) return { name: 'Your Name', phone: 'Your Phone', email: 'your@email.com' };
    const val = JSON.parse(raw) || {};
    return {
      name: val.name || 'Your Name',
      phone: val.phone || 'Your Phone',
      email: val.email || 'your@email.com'
    };
  }catch(_e){
    return { name: 'Your Name', phone: 'Your Phone', email: 'your@email.com' };
  }
}

function buildEmailTemplate(job){
  const profile = getUserProfile();
  const school = job.companyName || 'Your School';
  const subject = `Application for Teaching Position – ${school}`; // en dash
  const body = [
    'Dear Hiring Manager,',
    '',
    'I hope this message finds you well.',
    '',
    `My name is ${profile.name}, and I am reaching out to express my interest in working with your esteemed institution. I am attaching my resume for your review and consideration.`,
    '',
    'I would be grateful for an opportunity to discuss how my experience and skills align with your requirements.',
    '',
    'Thank you for your time and consideration.',
    '',
    'Warm regards,',
    profile.name,
    profile.phone,
    profile.email
  ].join('\n');
  return { subject, body };
}


function render(){
  const search = (document.getElementById('search').value || '').toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  const sortEl = document.getElementById('sort');
  const sort = sortEl ? sortEl.value : 'newest';

  let list = state.jobs.slice();
  if(search) list = list.filter(j => (j.companyName||'').toLowerCase().includes(search) || (j.jobTitle||'').toLowerCase().includes(search));
  if(statusFilter) list = list.filter(j => j.status === statusFilter);
  if(sort === 'newest') list.sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));
  else list.sort((a,b)=> (a.createdAt||'').localeCompare(b.createdAt||''));

  cardsEl.innerHTML = '';
  list.forEach(job => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.company').textContent = job.companyName || '—';
    node.querySelector('.jobTitle').textContent = job.jobTitle || '';
    node.querySelector('.location').textContent = job.location || '';
    node.querySelector('.notes').textContent = job.notes || '';
    node.querySelector('time.timestamp').textContent = job.createdAt ? new Date(job.createdAt).toLocaleString() : '';

    const emailA = node.querySelector('a.email');
    const phoneA = node.querySelector('a.phone');
    const websiteA = node.querySelector('a.website');
    const mapsA = node.querySelector('a.maps');
    if(job.contactEmail){
      const { subject, body } = buildEmailTemplate(job);
      const mailto = 'mailto:'+job.contactEmail+'?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      emailA.href = mailto;
    } else emailA.style.display='none';
    if(job.contactPhone){ phoneA.href = 'tel:'+job.contactPhone; } else phoneA.style.display='none';
    const websiteRaw = job.contactWebsite || extractUrl(job.notes);
    if(websiteRaw){ websiteA.href = ensureHttp(websiteRaw); } else websiteA.style.display='none';

    const mapsQueryRaw = ((job.companyName||'') + ' ' + (job.location||'')).trim();
    if(mapsQueryRaw){
      const q = encodeURIComponent(mapsQueryRaw);
      mapsA.href = `https://www.google.com/maps/search/?api=1&query=${q}`;
    } else {
      mapsA.style.display = 'none';
    }

    const statusSel = node.querySelector('select.statusSelect');
    ['Pending','Applied','Responded','Interview','Rejected','Hired'].forEach(s=>{
      const opt = document.createElement('option'); opt.value = s; opt.textContent = s; statusSel.appendChild(opt);
    });
    statusSel.value = job.status || 'Pending';
    statusSel.addEventListener('change', ()=> { job.status = statusSel.value; job.updatedAt = nowTs(); save(); render(); });

    node.querySelector('.edit').addEventListener('click', ()=> openEdit(job));
    node.querySelector('.delete').addEventListener('click', ()=> { if(confirm('Delete this job?')) removeJob(job.id); });

    cardsEl.appendChild(node);
  });
}

// Modal handling (bottom sheet)
function openSheet(){
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  // start off-screen then animate in
  requestAnimationFrame(()=>{
    jobForm.style.transform = 'translateY(0)';
  });
}
function closeSheet(){
  // animate down then hide
  jobForm.style.transform = 'translateY(100%)';
  setTimeout(()=>{
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    // reset for next open
    jobForm.style.transform = 'translateY(100%)';
  }, 180);
}

function openAdd(){
  editId = null;
  modalTitle.textContent = 'Add Job';
  jobForm.companyName.value = '';
  jobForm.jobTitle.value = '';
  jobForm.location.value = '';
  jobForm.contactEmail.value = '';
  jobForm.contactPhone.value = '';
  if(jobForm.contactWebsite) jobForm.contactWebsite.value = '';
  jobForm.notes.value = '';
  jobForm.status.value = 'Pending';
  openSheet();
}
function openEdit(job){
  editId = job.id;
  modalTitle.textContent = 'Edit Job';
  jobForm.companyName.value = job.companyName || '';
  jobForm.jobTitle.value = job.jobTitle || '';
  jobForm.location.value = job.location || '';
  jobForm.contactEmail.value = job.contactEmail || '';
  jobForm.contactPhone.value = job.contactPhone || '';
   if(jobForm.contactWebsite) jobForm.contactWebsite.value = job.contactWebsite || '';
  jobForm.notes.value = job.notes || '';
  jobForm.status.value = job.status || 'Pending';
  openSheet();
}

// Form submit
jobForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = new FormData(jobForm);
  const job = {
    id: editId,
    companyName: f.get('companyName'),
    jobTitle: f.get('jobTitle'),
    location: f.get('location'),
    contactEmail: f.get('contactEmail'),
    contactPhone: f.get('contactPhone'),
    contactWebsite: f.get('contactWebsite') || '',
    notes: f.get('notes'),
    status: f.get('status'),
    updatedAt: nowTs()
  };
  addOrUpdate(job);
  closeSheet();
});

// Cancel / buttons
document.getElementById('cancelBtn').addEventListener('click', closeSheet);
document.getElementById('addBtn').addEventListener('click', openAdd);

// Import JSON
document.getElementById('importBtn').addEventListener('click', ()=> document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=> {
    try{
      const arr = JSON.parse(reader.result);
      if(!Array.isArray(arr)) throw new Error('JSON must be an array of jobs');
      const normalized = arr.map(item=>({
        id: item.id || null,
        companyName: item.companyName || item.company || '',
        jobTitle: item.jobTitle || item.title || '',
        location: item.location || '',
        contactEmail: item.contactEmail || item.email || '',
        contactPhone: item.contactPhone || item.phone || '',
        notes: item.notes || '',
        status: item.status || 'Pending',
        createdAt: item.createdAt || nowTs()
      }));
      mergeJobs(normalized);
      alert('Imported ' + arr.length + ' items');
    }catch(err){
      alert('Import error: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// Export JSON
const exportBtn = document.getElementById('exportBtn');
if(exportBtn){
  exportBtn.addEventListener('click', ()=>{
    try{
      const data = JSON.stringify(state.jobs, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0,10);
      a.href = url;
      a.download = `jobs-export-${date}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=> URL.revokeObjectURL(url), 1500);
    }catch(err){
      alert('Export failed: ' + (err && err.message ? err.message : err));
    }
  });
}

// Initial load: load from localStorage; if empty, load bundled default + attempt to fetch default_jobs.json and merge
load();
if(!state.jobs || state.jobs.length===0){
  mergeJobs(bundledDefaultJobs);
  fetch('default_jobs.json').then(r=>r.ok? r.json(): null).then(data=>{ if(Array.isArray(data)) mergeJobs(data); }).catch(()=>{});
}
render();

// Search/filter listeners
['search','statusFilter'].forEach(id=>{ const el = document.getElementById(id); if(el) el.addEventListener('input', render); });

// Bottom sheet drag handle
(function(){
  const handle = document.getElementById('sheetHandle');
  if(!handle) return;
  let dragging = false;
  let startY = 0;
  let currentY = 0;

  function onStart(e){
    dragging = true;
    startY = (e.touches ? e.touches[0].clientY : e.clientY);
    currentY = 0;
    jobForm.style.transitionProperty = 'transform';
  }
  function onMove(e){
    if(!dragging) return;
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    currentY = Math.max(0, y - startY);
    jobForm.style.transform = `translateY(${currentY}px)`;
  }
  function onEnd(){
    if(!dragging) return;
    dragging = false;
    const threshold = 120;
    if(currentY > threshold){
      closeSheet();
    }else{
      jobForm.style.transform = 'translateY(0)';
    }
  }

  handle.addEventListener('mousedown', onStart);
  handle.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
})();

// Service worker registration
if('serviceWorker' in navigator){ navigator.serviceWorker.register('service-worker.js').catch(console.error); }

// Theme toggle
(function(){
  const THEME_KEY = 'job-tracker.theme.v1';
  const btn = document.getElementById('themeToggleBtn');
  const icon = document.getElementById('themeIcon');
  function apply(theme){
    const light = theme === 'light';
    document.body.classList.toggle('theme-light', light);
    // Show icon for NEXT theme: sun when currently dark (to switch to light), moon when currently light
    if(icon){
      icon.innerHTML = light
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 6.95l-1.414-1.414M7.464 7.464L6.05 6.05m12.9 0l-1.414 1.414M7.464 16.536L6.05 17.95M12 8a4 4 0 100 8 4 4 0 000-8z"/>';
    }
    if(btn){ btn.title = light ? 'Switch to dark theme' : 'Switch to light theme'; btn.setAttribute('aria-label', btn.title); }
    localStorage.setItem(THEME_KEY, theme);
  }
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  apply(saved);
  if(btn){
    btn.addEventListener('click', ()=>{
      const next = (localStorage.getItem(THEME_KEY) || 'dark') === 'dark' ? 'light' : 'dark';
      apply(next);
    });
  }
})();
