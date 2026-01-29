// Simple SPA for Track Day Lap Time Tracker
// Data model: stored in localStorage under key 'td_tracks'

const STORAGE_KEY = 'td_tracks_v1';
const USER_KEY = 'td_user_v1';

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

// Built-in sample tracks included with the app. These are shown automatically
// when the user's localStorage is empty so they can browse tracks immediately.
const SAMPLE_TRACKS = [
  {
    id: 'sample-silverstone',
    name: 'Silverstone Circuit',
    location: 'UK',
  image: 'track image/Silverstone_Circuit_2020.png',
    length_km: 5.891,
    difficulty: 'Medium',
    description: 'Fast, flowing circuit used for Formula 1 in the UK.',
    laps: [
      {id: 's1', name:'Alice', time: 84123, when: Date.now()-86400000},
      {id: 's2', name:'Bob', time: 79250, when: Date.now()-3600000},
      {id: 's3', name:'Dan', time: 78050, when: Date.now()-18000000}
    ]
  },
  {
    id: 'sample-laguna',
    name: 'Laguna Seca',
    location: 'USA',
  image: 'track image/Laguna_Seca.svg',
    length_km: 3.602,
    difficulty: 'Medium',
    description: 'Technical track with the famous Corkscrew turn in California.',
    laps:[
      {id: 'l1', name:'Carmen', time: 90500, when: Date.now()-7200000},
      {id: 'l2', name:'Eve', time: 89234, when: Date.now()-4000000}
    ]
  },
  {
    id: 'sample-monza',
    name: 'Autodromo Nazionale Monza',
    location: 'Italy',
  image: 'track image/Monza_Map-2021.png',
    length_km: 5.793,
    difficulty: 'Easy',
    description: 'High-speed historic circuit near Milan, known for long straights.',
    laps:[
      {id: 'm1', name:'Francesco', time: 78000, when: Date.now()-20000000},
      {id: 'm2', name:'Luca', time: 76890, when: Date.now()-15000000}
    ]
  },
  {
    id: 'sample-nordschleife',
    name: 'Nürburgring Nordschleife',
    location: 'Germany',
  image: 'track image/Circuit_Nürburgring-2013-Nordschleife.svg.png',
    length_km: 20.832,
    difficulty: 'Hard',
    description: 'Long, demanding and dangerous old Nordschleife — many corners and elevation changes.',
    laps:[
      {id: 'n1', name:'Klaus', time: 1350000, when: Date.now()-864000000},
      {id: 'n2', name:'Hans', time: 1325000, when: Date.now()-700000000}
    ]
  },
  {
    id: 'sample-suzuka',
    name: 'Suzuka Circuit',
    location: 'Japan',
  image: 'track image/Suzuka_circuit_map--2005.svg.png',
    length_km: 5.807,
    difficulty: 'Medium',
    description: 'Figure-eight layout with a mix of technical and flowing sections.',
    laps:[
      {id: 'sz1', name:'Hiro', time: 117500, when: Date.now()-30000000},
      {id: 'sz2', name:'Ken', time: 116234, when: Date.now()-25000000}
    ]
  },
  {
    id: 'sample-spa',
    name: 'Circuit de Spa-Francorchamps',
    location: 'Belgium',
  image: 'track image/Spa-Francorchamps_of_Belgium.svg.png',
    length_km: 7.004,
    difficulty: 'Hard',
    description: 'Famous for Eau Rouge and long lap distance through Ardennes forests.',
    laps:[
      {id: 'sp1', name:'Jean', time: 158234, when: Date.now()-50000000},
      {id: 'sp2', name:'Marc', time: 156780, when: Date.now()-45000000}
    ]
  }
  ,
  {
    id: 'sample-cota',
    name: 'Circuit of the Americas',
    location: 'USA',
  image: 'track image/Austin_circuit.svg.png',
    length_km: 5.513,
    difficulty: 'Medium',
    description: 'Modern US circuit near Austin with a steep climb into Turn 1 and a mix of technical sectors.',
    laps:[{id:'c1',name:'Sam',time:125000,when:Date.now()-20000000}]
  },
  {
    id: 'sample-interlagos',
    name: "Autódromo José Carlos Pace (Interlagos)",
    location: 'Brazil',
  image: 'track image/Autódromo_José_Carlos_Pace_(AKA_Interlagos)_track_map.svg.png',
    length_km: 4.309,
    difficulty: 'Medium',
    description: 'Undulating, high-energy circuit in São Paulo with elevation changes and lively crowds.',
    laps:[{id:'i1',name:'Carlos',time:88000,when:Date.now()-12000000}]
  },
  {
    id: 'sample-daytona',
    name: 'Daytona International Speedway (Tri-oval)',
    location: 'USA',
  image: 'track image/Daytona_International_Speedway_2024.svg.png',
    length_km: 4.023,
    difficulty: 'Easy',
    description: 'High-speed tri-oval famous for the Daytona 500; several infield road-course variants also exist.',
    laps:[{id:'d1',name:'Ty',time:240000,when:Date.now()-30000000}]
  },
  {
    id: 'sample-sebring',
    name: 'Sebring International Raceway',
    location: 'USA',
  image: 'track image/Sebring_International_Raceway.svg.png',
    length_km: 6.019,
    difficulty: 'Hard',
    description: 'Historic and brutally bumpy endurance circuit used for the 12 Hours of Sebring.',
    laps:[{id:'sb1',name:'Alex',time:210000,when:Date.now()-40000000}]
  },
  {
    id: 'sample-bathurst',
    name: 'Mount Panorama Circuit (Bathurst)',
    location: 'Australia',
  image: 'track image/Mount_Panorama_Circuit_Map_Overview.png',
    length_km: 6.172,
    difficulty: 'Hard',
    description: 'Iconic mountain circuit with large elevation changes and fast straights; home of the Bathurst 1000.',
    laps:[{id:'b1',name:'Jim',time:119000,when:Date.now()-60000000}]
  },
  {
    id: 'sample-imola',
    name: 'Autodromo Enzo e Dino Ferrari (Imola)',
    location: 'Italy',
  image: 'track image/Imola_2009.svg.png',
    length_km: 4.909,
    difficulty: 'Medium',
    description: 'Historic technical circuit in Emilia-Romagna with fast and flowing sections.',
    laps:[{id:'im1',name:'Marco',time:75500,when:Date.now()-22000000}]
  },
  {
    id: 'sample-paulricard',
    name: 'Circuit Paul Ricard',
    location: 'France',
  image: 'track image/Le_Castellet_2019_all_layouts.svg.png',
    length_km: 5.842,
    difficulty: 'Medium',
    description: 'Modern testing-friendly circuit with long Mistral straight and distinctive blue run-off areas.',
    laps:[{id:'pr1',name:'Jean',time:98000,when:Date.now()-32000000}]
  },
  {
    id: 'sample-catalunya',
    name: 'Circuit de Barcelona-Catalunya',
    location: 'Spain',
  image: 'track image/Circuit_de_Catalunya_moto_2021.svg.png',
    length_km: 4.657,
    difficulty: 'Medium',
    description: 'All-rounder circuit near Barcelona with a mix of long straights and technical corners.',
    laps:[{id:'cb1',name:'Pablo',time:89000,when:Date.now()-25000000}]
  },
  {
    id: 'sample-hockenheim',
    name: 'Hockenheimring',
    location: 'Germany',
  image: 'track image/Hockenheim2012.svg.png',
    length_km: 4.574,
    difficulty: 'Medium',
    description: 'German circuit with a mix of long straights and an arena-section; has multiple configurations.',
    laps:[{id:'h1',name:'Stefan',time:76000,when:Date.now()-15000000}]
  },
  {
    id: 'sample-brandshatch',
    name: 'Brands Hatch',
    location: 'UK',
    image: 'track image/Brands_Hatch_2003.svg.png',
    length_km: 3.916,
    difficulty: 'Medium',
    description: 'Historic British circuit with an Indy and Grand Prix layouts; tight and undulating.',
    laps:[{id:'br1',name:'Neil',time:64000,when:Date.now()-18000000}]
  }
];

// No remote fetch required for images: use local files in `track image/`.
async function fetchWikiLeadImages(){
  // Intentionally a no-op because images are bundled locally in the `track image/` folder.
  return Promise.resolve();
}

function loadTracks(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) {
    // Don't force-persist sample tracks; show them as read-only samples so user can browse.
    return [...SAMPLE_TRACKS];
  }
  try{
    return JSON.parse(raw);
  }catch(e){return [...SAMPLE_TRACKS];}
}

function saveTracks(tracks){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks)); }

let tracks = loadTracks();
let activeTrackId = null;
const WEATHER_OPTIONS = ['Sunny','Windy','Rainy','Snowy','Overcast','Foggy'];

function randomWeather(){
  return WEATHER_OPTIONS[Math.floor(Math.random()*WEATHER_OPTIONS.length)];
}

// Map of track.id -> exact local image filename placed in `track image/`.
// This helps avoid problems with spaces, accents or mismatched wiki tokens.
const IMAGE_MAP = {
  'sample-silverstone': 'track image/Silverstone_Circuit_2020.png',
  'sample-laguna': 'track image/Laguna_Seca.svg',
  'sample-monza': 'track image/Monza_Map-2021.png',
  'sample-nordschleife': 'track image/Circuit_Nürburgring-2013-Nordschleife.svg.png',
  'sample-suzuka': 'track image/Suzuka_circuit_map--2005.svg.png',
  'sample-spa': 'track image/Spa-Francorchamps_of_Belgium.svg.png',
  'sample-cota': 'track image/Austin_circuit.svg.png',
  'sample-interlagos': 'track image/Autódromo_José_Carlos_Pace_(AKA_Interlagos)_track_map.svg.png',
  'sample-daytona': 'track image/Daytona_International_Speedway_2024.svg.png',
  'sample-sebring': 'track image/Sebring_International_Raceway.svg.png',
  'sample-bathurst': 'track image/Mount_Panorama_Circuit_Map_Overview.png',
  'sample-imola': 'track image/Imola_2009.svg.png',
  'sample-paulricard': 'track image/Le_Castellet_2019_all_layouts.svg.png',
  'sample-catalunya': 'track image/Circuit_de_Catalunya_moto_2021.svg.png',
  'sample-hockenheim': 'track image/Hockenheim2012.svg.png',
  'sample-brandshatch': 'track image/Brands_Hatch_2003.svg.png'
};

// Utilities: format ms -> mm:ss.ms
function fmtTime(ms){
  const total = Math.round(ms);
  const minutes = Math.floor(total/60000);
  const seconds = Math.floor((total%60000)/1000);
  const msec = Math.floor((total%1000)/10);
  return `${minutes}:${String(seconds).padStart(2,'0')}.${String(msec).padStart(2,'0')}`;
}

// Parse input: accept mm:ss.ms or plain seconds (float)
function parseTimeInput(str){
  str = str.trim();
  if(!str) return null;
  // mm:ss.ms
  const mmss = str.match(/^(\d+):([0-5]?\d)(?:[.:](\d{1,3}))?$/);
  if(mmss){
    const m = parseInt(mmss[1],10);
    const s = parseInt(mmss[2],10);
    let ms = 0;
    if(mmss[3]){
      const frac = mmss[3];
      ms = Math.round((frac.length===3?parseInt(frac):parseInt(frac)*Math.pow(10,3-frac.length)));
    }
    return m*60000 + s*1000 + ms;
  }
  // seconds as float
  const asNum = Number(str);
  if(!Number.isNaN(asNum)) return Math.round(asNum*1000);
  return null;
}

// Render track list
function renderTrackList(filter='', countryFilter='', sortOption=''){
  const listEl = document.getElementById('track-list');
  listEl.innerHTML = '';
  const template = document.getElementById('track-item-template');
  const frag = document.createDocumentFragment();
  // If caller didn't pass filters, read current UI values
  const countrySel = document.getElementById('country-filter');
  const sortSel = document.getElementById('sort-select');
  if((countryFilter===undefined || countryFilter==='') && countrySel) countryFilter = countrySel.value;
  if((sortOption===undefined || sortOption==='') && sortSel) sortOption = sortSel.value;

  // Filter by text and country
  let filtered = tracks.filter(t=> {
    const matchesText = t.name.toLowerCase().includes((filter||'').toLowerCase()) || (t.location||'').toLowerCase().includes((filter||'').toLowerCase());
    const matchesCountry = !countryFilter || (t.location||'') === countryFilter;
    return matchesText && matchesCountry;
  });

  // Sorting
  if(sortOption){
    const difficultyRank = (d)=>{ const m={'Easy':1,'Medium':2,'Hard':3}; return m[d]||2 };
    if(sortOption==='length-asc') filtered.sort((a,b)=> (a.length_km||0) - (b.length_km||0));
    else if(sortOption==='length-desc') filtered.sort((a,b)=> (b.length_km||0) - (a.length_km||0));
    else if(sortOption==='difficulty-asc') filtered.sort((a,b)=> difficultyRank(a.difficulty) - difficultyRank(b.difficulty));
    else if(sortOption==='difficulty-desc') filtered.sort((a,b)=> difficultyRank(b.difficulty) - difficultyRank(a.difficulty));
  }

  filtered.forEach(track=>{
    const node = template.content.cloneNode(true);
    const li = node.querySelector('li');
    li.dataset.id = track.id;
    li.querySelector('.track-title').textContent = track.name;
    const best = track.laps && track.laps.length ? Math.min(...track.laps.map(l=>l.time)) : null;
    li.querySelector('.best-time').textContent = best?fmtTime(best):'—';
    li.addEventListener('click',()=>openTrackById(track.id));
    frag.appendChild(node);
  });
  listEl.appendChild(frag);
}

function openTrack(id){
  activeTrackId = id;
  const track = tracks.find(t=>t.id===id);
  if(!track) return;
  document.getElementById('track-list-view').classList.add('hidden');
  document.getElementById('track-detail-view').classList.remove('hidden');
  document.getElementById('track-name').textContent = track.name;
  document.getElementById('track-location').textContent = track.location || '';
  // Populate media & metadata
  const imgEl = document.getElementById('track-image');
  const lengthEl = document.getElementById('track-length');
  const diffEl = document.getElementById('track-difficulty');
  const descEl = document.getElementById('track-description');
  if(imgEl){
    // Prefer explicit IMAGE_MAP entry (exact filename), then track.image, then placeholder.
    const candidate = IMAGE_MAP[track.id] || track.image;
    const imgSrc = (candidate && !String(candidate).startsWith('wiki:')) ? candidate : 'https://via.placeholder.com/800x400.png?text=No+Image';
    imgEl.src = encodeURI(imgSrc);
    imgEl.alt = track.name + ' image';
    // Add a class when the image is an SVG (or svg.png) so CSS can style it
    try{
      imgEl.classList.remove('is-svg','is-svg-png');
      const low = String((IMAGE_MAP[track.id] || track.image) || '').toLowerCase();
      if(low.endsWith('.svg.png') || low.endsWith('.svg.png?') || low.indexOf('.svg.png')!==-1) imgEl.classList.add('is-svg-png');
      else if(low.endsWith('.svg') || low.indexOf('.svg?')!==-1 || low.indexOf('.svg')!==-1) imgEl.classList.add('is-svg');
    }catch(e){/* ignore */}
  }
  if(lengthEl) lengthEl.textContent = track.length_km ? `${track.length_km} km` : 'Unknown';
  if(diffEl) diffEl.textContent = track.difficulty || 'Unknown';
  renderStats(track);
  renderLaps(track);
  // Update upload button visibility depending on auth
  toggleUploadForAuth();
}

function renderStats(track){
  if(!track.laps || track.laps.length===0){
    document.getElementById('stat-avg').textContent = '—';
    document.getElementById('stat-worst').textContent = '—';
    return;
  }
  const times = track.laps.map(l=>l.time);
  const best = Math.min(...times);
  const worst = Math.max(...times);
  const avg = Math.round(times.reduce((a,b)=>a+b,0)/times.length);
  document.getElementById('stat-best').textContent = fmtTime(best);
  document.getElementById('stat-worst').textContent = fmtTime(worst);
}

function renderLaps(track){
  const tbody = document.getElementById('laps-body');
  tbody.innerHTML = '';
  if(!track.laps) track.laps = [];
  // Apply weather filter if selected in detail view
  const weatherSel = document.getElementById('weather-filter');
  const weatherFilter = weatherSel ? (weatherSel.value || '') : '';
  // Sort ascending by time (fastest first) and apply optional weather filter
  const sorted = [...track.laps].slice().sort((a,b)=>a.time-b.time).filter(lap => {
    if(!weatherFilter) return true;
    return (lap.weather || '').toString() === weatherFilter;
  });
  sorted.forEach((lap,idx)=>{
    const tr = document.createElement('tr');
    const when = new Date(lap.when);
    const car = lap.car || lap.carModel || '';
    const weather = lap.weather || '';
    // If the current user submitted this lap, visually highlight the row
    const currentUser = getCurrentUser();
    if(currentUser && currentUser.name === lap.name){
      tr.classList.add('lap-user');
    }
    tr.innerHTML = `<td>${idx+1}</td><td>${lap.name}</td><td>${car}</td><td>${weather}</td><td>${fmtTime(lap.time)}</td><td>${when.toLocaleString()}</td>`;
    tbody.appendChild(tr);
  });
}

function backToList(){
  activeTrackId = null;
  document.getElementById('track-detail-view').classList.add('hidden');
  document.getElementById('track-list-view').classList.remove('hidden');
  try{ history.replaceState && history.replaceState(null, '', window.location.pathname + window.location.search); }catch(e){}
  // reset weather filter when leaving detail view
  try{ const wf = document.getElementById('weather-filter'); if(wf) wf.value = ''; }catch(e){}
}

function openProfile(){
  const user = getCurrentUser();
  if(!user){ alert('Please log in to view your profile.'); return; }
  // hide other views
  document.getElementById('track-detail-view').classList.add('hidden');
  document.getElementById('profile-view').classList.remove('hidden');
  renderProfile(user);
  try{ location.hash = '#profile'; }catch(e){}
}

function renderProfile(user){
  const summaryEl = document.getElementById('profile-summary');
  const nameEl = document.getElementById('profile-name');
  const mostCarEl = document.getElementById('profile-most-car');
  nameEl.textContent = user.name + "'s Profile";
  // Gather all laps submitted by this user
  const userLaps = [];
  tracks.forEach(track=>{
    if(!track.laps) return;
    track.laps.forEach(lap=>{
        if(lap.name === user.name){
          userLaps.push({ trackId: track.id, trackName: track.name, lap });
        }
      });
  });
  // Count submissions
  const totalSubmitted = userLaps.length;
  summaryEl.textContent = `You have submitted ${totalSubmitted} record${totalSubmitted===1?'' :'s'}. Below are your laps that are currently top-3 on their track.`;

  // Compute most driven car by the user (frequency). Tiebreak: most recent submission wins.
  let mostCar = '—';
  if(userLaps.length>0){
    const carMap = {};
    userLaps.forEach(({lap})=>{
      const car = (lap.car || lap.carModel || '').trim();
      if(!car) return;
      if(!carMap[car]) carMap[car] = {count:0, lastWhen:0};
      carMap[car].count += 1;
      if(lap.when && lap.when > carMap[car].lastWhen) carMap[car].lastWhen = lap.when;
    });
    const entries = Object.entries(carMap);
    if(entries.length>0){
      entries.sort((a,b)=>{
        // primary: count desc
        if(a[1].count !== b[1].count) return b[1].count - a[1].count;
        // tiebreak: lastWhen desc (more recent wins)
        return b[1].lastWhen - a[1].lastWhen;
      });
      mostCar = entries[0][0];
    }
  }
  if(mostCarEl) mostCarEl.textContent = mostCar;

  // Compute top-3 laps per track and filter user's laps to those top-3
  const top3ByTrack = {};
  tracks.forEach(track=>{
    const laps = (track.laps||[]).slice().sort((a,b)=>a.time-b.time).slice(0,3);
    top3ByTrack[track.id] = laps.map((l,i)=>({pos: i+1, id: l.id, name: l.name, time: l.time, when: l.when, car: l.car||l.carModel||''}));
  });

  const userTop3 = [];
  userLaps.forEach(({trackId, trackName, lap})=>{
    const top = top3ByTrack[trackId] || [];
    const idx = top.findIndex(t => t.id === lap.id);
    if(idx !== -1){
      // total records on this track (total laps submitted)
      const trackObj = tracks.find(t=>t.id===trackId);
      const total = trackObj && trackObj.laps ? trackObj.laps.length : 0;
      userTop3.push({ trackName, position: top[idx].pos, totalRecords: total, time: lap.time, when: lap.when, car: lap.car||lap.carModel||'' });
    }
  });

  // Render table
  tbody.innerHTML = '';
  if(userTop3.length===0){
    tbody.innerHTML = `<tr><td colspan="6">You have no laps that are currently in the top-3 for any track.</td></tr>`;
    return;
  }
  userTop3.sort((a,b)=>{
    if(a.position !== b.position) return a.position - b.position; // 1 before 2
    if((a.totalRecords||0) !== (b.totalRecords||0)) return (b.totalRecords||0) - (a.totalRecords||0); // more records ranks higher
    return (a.trackName||'').localeCompare(b.trackName||'');
  });
  userTop3.forEach((r,idx)=>{
    const tr = document.createElement('tr');
    const whenStr = new Date(r.when).toLocaleString();
    const totalStr = r.totalRecords != null ? r.totalRecords : '—';
    tr.innerHTML = `<td>${idx+1}</td><td>${r.trackName}</td><td>${r.position}/${totalStr}</td><td>${fmtTime(r.time)}</td><td>${whenStr}</td><td>${r.car}</td>`;
    tbody.appendChild(tr);
  });
}

// Open a track by id and update URL hash so refresh restores view
function openTrackById(id){
  // ensure weather filter reset when opening a new track from list
  try{ const wf = document.getElementById('weather-filter'); if(wf) wf.value = ''; }catch(e){}
  openTrack(id);
  try{ location.hash = '#track:' + encodeURIComponent(id); }catch(e){}
}

function showModal(){ document.getElementById('modal').classList.remove('hidden'); }
function hideModal(){ document.getElementById('modal').classList.add('hidden'); }

// Toast notifications (non-blocking)
function showToast(message, type='info', duration=4000){
  try{
    const container = document.getElementById('toast-container');
    if(!container) return;
    const node = document.createElement('div');
    node.className = 'toast ' + (type||'info');
    node.textContent = message;
    container.appendChild(node);
    // force reflow then show
    requestAnimationFrame(()=> node.classList.add('show'));
    // remove after duration
    setTimeout(()=>{
      node.classList.remove('show');
      setTimeout(()=>{ try{ container.removeChild(node); }catch(e){} },250);
    }, duration);
  }catch(e){ /* fail silently */ }
}

function getCurrentUser(){
  try{ return JSON.parse(localStorage.getItem(USER_KEY)); }catch(e){return null}
}

function setCurrentUser(user){
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function logoutUser(){
  localStorage.removeItem(USER_KEY);
}

function updateAuthUI(){
  const user = getCurrentUser();
  const userDisplay = document.getElementById('user-display');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const profileBtn = document.getElementById('profile-btn');
  if(user){
    if(userDisplay) userDisplay.textContent = user.name;
    if(loginBtn) loginBtn.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = '';
    if(profileBtn) profileBtn.style.display = '';
  } else {
    if(userDisplay) userDisplay.textContent = '';
    if(loginBtn) loginBtn.style.display = '';
    if(logoutBtn) logoutBtn.style.display = 'none';
    if(profileBtn) profileBtn.style.display = 'none';
  }
}

function toggleUploadForAuth(){
  const user = getCurrentUser();
  const addBtn = document.getElementById('add-lap-btn');
  const loginStatus = document.getElementById('login-status');
  if(addBtn){
    if(user){
      addBtn.style.display = '';
      if(loginStatus) loginStatus.textContent = '';
    } else {
      addBtn.style.display = 'none';
      if(loginStatus) loginStatus.textContent = 'Log in to upload lap times.';
    }
  }
}

function init(){
  renderTrackList();
  document.getElementById('search').addEventListener('input',e=>renderTrackList(e.target.value));
  // Populate country filter based on tracks
  const countrySel = document.getElementById('country-filter');
  function populateCountryFilter(){
    if(!countrySel) return;
    const locations = Array.from(new Set(tracks.map(t=>t.location).filter(Boolean))).sort();
    countrySel.innerHTML = '<option value="">All countries</option>' + locations.map(l=>`<option value="${l}">${l}</option>`).join('');
  }
  populateCountryFilter();
  // Ensure existing laps have a weather value (assign random) and persist if we filled any in
  let addedWeather = false;
  tracks.forEach(track=>{
    if(!track.laps) return;
    track.laps.forEach(lap=>{
      if(!lap.weather){ lap.weather = randomWeather(); addedWeather = true; }
    });
  });
  if(addedWeather){ saveTracks(tracks); }
  // Wire filter and sort dropdowns
  const sortSel = document.getElementById('sort-select');
  if(countrySel) countrySel.addEventListener('change', ()=> renderTrackList(document.getElementById('search').value || '', countrySel.value, sortSel?sortSel.value:''));
  if(sortSel) sortSel.addEventListener('change', ()=> renderTrackList(document.getElementById('search').value || '', countrySel?countrySel.value:'', sortSel.value));
  // Wire weather filter in detail view to re-render laps when changed
  const weatherFilterEl = document.getElementById('weather-filter');
  if(weatherFilterEl){
    weatherFilterEl.addEventListener('change', ()=>{
      if(activeTrackId){
        const track = tracks.find(t=>t.id===activeTrackId);
        if(track) renderLaps(track);
      }
    });
  }
  // Auth handlers (simple local login)
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  if(loginBtn) loginBtn.addEventListener('click', ()=>{
    const name = prompt('Enter your name to log in:');
    if(!name) return;
    setCurrentUser({name: name.trim()});
    updateAuthUI();
    toggleUploadForAuth();
  });
  if(logoutBtn) logoutBtn.addEventListener('click', ()=>{ logoutUser(); updateAuthUI(); toggleUploadForAuth(); });
  // Profile button: open user profile view
  const profileBtn = document.getElementById('profile-btn');
  if(profileBtn) profileBtn.addEventListener('click', ()=>{ openProfile(); });

  document.getElementById('back-btn').addEventListener('click',backToList);

  // Modal-based lap submission flow
  const addLapBtn = document.getElementById('add-lap-btn');
  const modalForm = document.getElementById('modal-form');
  const modalLapInput = document.getElementById('modal-lap-input');
  const modalCarInput = document.getElementById('modal-car-model');
  const modalCancel = document.getElementById('modal-cancel');
  if(addLapBtn) addLapBtn.addEventListener('click', ()=>{
    showModal();
    // focus first field when modal opens
    setTimeout(()=>{
      const el = document.getElementById('modal-lap-input');
      if(el) el.focus();
    },50);
  });
  if(modalCancel) modalCancel.addEventListener('click', ()=>{ hideModal(); });
  if(modalForm){
    modalForm.addEventListener('submit', e=>{
      e.preventDefault();
      const user = getCurrentUser();
      if(!user){ alert('Please log in to upload lap times.'); hideModal(); return; }
      const name = user.name || 'Anonymous';
      const timeRaw = (modalLapInput.value||'').trim();
      const ms = parseTimeInput(timeRaw);
      if(ms===null){ alert('Invalid time format. Use mm:ss.ms or seconds like 75.234'); return; }
  const carModel = (modalCarInput.value||'').trim();
  const weatherValEl = document.getElementById('modal-weather');
  const weatherVal = weatherValEl ? (weatherValEl.value || randomWeather()) : randomWeather();
      const track = tracks.find(t=>t.id===activeTrackId);
      if(!track) return;
      track.laps = track.laps||[];
      // Validation: new time cannot be >50% slower than current slowest or >25% faster than current fastest
      if(track.laps.length>0){
        const times = track.laps.map(l=>l.time);
        const fastest = Math.min(...times);
        const slowest = Math.max(...times);
        const minAllowed = Math.round(fastest * 0.75); // not more than 25% faster (i.e., time >= 75% of fastest)
        const maxAllowed = Math.round(slowest * 1.5);  // not more than 50% slower
        if(ms < minAllowed){
          alert(`Lap rejected: submitted time (${fmtTime(ms)}) is more than 25% faster than current fastest (${fmtTime(fastest)}). Minimum allowed is ${fmtTime(minAllowed)}.`);
          return;
        }
        if(ms > maxAllowed){
          alert(`Lap rejected: submitted time (${fmtTime(ms)}) is more than 50% slower than current slowest (${fmtTime(slowest)}). Maximum allowed is ${fmtTime(maxAllowed)}.`);
          return;
        }
      }
      const newLap = {id: uid(), name, car: carModel, weather: weatherVal, time: ms, when: Date.now()};
      track.laps.push(newLap);
      // determine if the new lap is now in the top-3 for this track
      const sortedTimes = [...track.laps].sort((a,b)=>a.time-b.time);
      const newIndex = sortedTimes.findIndex(l => l.id === newLap.id);
      saveTracks(tracks);
      renderStats(track);
      renderLaps(track);
      modalForm.reset();
      hideModal();
      renderTrackList();
      if(newIndex !== -1 && newIndex < 3){
        const pos = newIndex + 1;
        // congratulate the user with a friendly toast
        showToast(`Congratulations ${name}! Your lap is now #${pos} on ${track.name}. Great driving!`, 'success', 6000);
      }
    });
  }

  // Profile back button
  const profileBack = document.getElementById('profile-back');
  if(profileBack) profileBack.addEventListener('click', ()=>{ document.getElementById('profile-view').classList.add('hidden'); document.getElementById('track-list-view').classList.remove('hidden'); });

  updateAuthUI();
  toggleUploadForAuth();
  // Attempt to fetch Wikipedia lead images for tracks marked with wiki: keys
  fetchWikiLeadImages().then(()=>{
    // refresh list/detail if needed after images load
    // After images resolve, restore view from hash if present, otherwise refresh list/detail
    const h = location.hash || '';
    if(h.startsWith('#track:')){
      const id = decodeURIComponent(h.slice(7));
      const track = tracks.find(t=>t.id===id);
      if(track) openTrack(id);
      else renderTrackList();
    } else if(h === '#profile'){
      const user = getCurrentUser();
      if(user) openProfile(); else renderTrackList();
    } else {
      renderTrackList();
    }
  });
}

// Init when DOM ready
window.addEventListener('DOMContentLoaded', init);
