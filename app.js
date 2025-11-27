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

function render(){
  const search = (document.getElementById('search').value || '').toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  const sort = document.getElementById('sort').value;

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
    if(job.contactEmail){ emailA.href = 'mailto:'+job.contactEmail+'?subject=' + encodeURIComponent((job.jobTitle||'') + ' — ' + (job.companyName||'')); emailA.textContent = 'Email'; } else emailA.style.display='none';
    if(job.contactPhone){ phoneA.href = 'tel:'+job.contactPhone; phoneA.textContent = 'Call'; } else phoneA.style.display='none';

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

// Modal handling
function openAdd(){
  editId = null;
  modalTitle.textContent = 'Add Job';
  jobForm.companyName.value = '';
  jobForm.jobTitle.value = '';
  jobForm.location.value = '';
  jobForm.contactEmail.value = '';
  jobForm.contactPhone.value = '';
  jobForm.notes.value = '';
  jobForm.status.value = 'Pending';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
function openEdit(job){
  editId = job.id;
  modalTitle.textContent = 'Edit Job';
  jobForm.companyName.value = job.companyName || '';
  jobForm.jobTitle.value = job.jobTitle || '';
  jobForm.location.value = job.location || '';
  jobForm.contactEmail.value = job.contactEmail || '';
  jobForm.contactPhone.value = job.contactPhone || '';
  jobForm.notes.value = job.notes || '';
  jobForm.status.value = job.status || 'Pending';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
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
    notes: f.get('notes'),
    status: f.get('status'),
    updatedAt: nowTs()
  };
  addOrUpdate(job);
  modal.classList.add('hidden');
  modal.classList.remove('flex');
});

// Cancel / buttons
document.getElementById('cancelBtn').addEventListener('click', ()=> { modal.classList.add('hidden'); modal.classList.remove('flex'); });
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

// Initial load: load from localStorage; if empty, load bundled default + attempt to fetch default_jobs.json and merge
load();
if(!state.jobs || state.jobs.length===0){
  mergeJobs(bundledDefaultJobs);
  fetch('default_jobs.json').then(r=>r.ok? r.json(): null).then(data=>{ if(Array.isArray(data)) mergeJobs(data); }).catch(()=>{});
}
render();

// Search/filter/sort listeners
['search','statusFilter','sort'].forEach(id=>{ document.getElementById(id).addEventListener('input', render); });

// Service worker registration
if('serviceWorker' in navigator){ navigator.serviceWorker.register('service-worker.js').catch(console.error); }
