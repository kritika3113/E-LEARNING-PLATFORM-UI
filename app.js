/* Demo course data */
const COURSES = [
  {
    id: 'c1',
    title: 'HTML Essentials',
    author: 'Web Basics',
    duration: '1h 45m',
    description: 'Structure web pages with semantic HTML elements and best practices.',
    videoId: 'UB1O30fR-EE',
    image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=900&q=60',
    modules: ['Tags', 'Semantics', 'Forms', 'Accessibility']
  },
  {
    id: 'c2',
    title: 'CSS Fundamentals',
    author: 'Design Hub',
    duration: '2h 30m',
    description: 'Learn selectors, the box model, Flexbox, and Grid for layout.',
    videoId: '1Rs2ND1ryYc',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=60',
    modules: ['Selectors', 'Box Model', 'Flexbox', 'Grid']
  },
  {
    id: 'c3',
    title: 'Intro to JavaScript',
    author: 'Jane Doe',
    duration: '2h 30m',
    description: 'Variables, functions, DOM manipulation and events to build dynamic pages.',
    videoId: 'upDLs1sn7g4',
    image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=900&q=60',
    modules: ['Basics', 'Functions', 'DOM', 'Events']
  },
  {
    id: 'c4',
    title: 'Python Basics',
    author: 'Data Academy',
    duration: '3h 15m',
    description: 'Core Python syntax, data structures and simple scripts.',
    videoId: 'HGOBQPFzWKo',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=60',
    modules: ['Syntax', 'Data Types', 'Control Flow', 'Lists & Dicts']
  },
  {
    id: 'c5',
    title: 'Git & Version Control',
    author: 'Collab Tools',
    duration: '1h 20m',
    description: 'Track changes, branch, merge and collaborate using Git basics.',
    videoId: 'USjZcfj8yxE',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=60',
    modules: ['Init', 'Commits', 'Branching', 'Merging']
  },
  {
    id: 'c6',
    title: 'SQL Fundamentals',
    author: 'Data Hub',
    duration: '2h 00m',
    description: 'Query relational databases using SELECT, JOIN and filtering.',
    videoId: 'HXV3zeQKqGY',
    image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=60',
    modules: ['SELECT', 'WHERE', 'JOIN', 'Aggregation']
  },
  {
    id: 'c7',
    title: 'React Basics',
    author: 'Frontend Lab',
    duration: '2h 10m',
    description: 'Components, props and state to build interactive UIs.',
    videoId: 'w7ejDZ8SWv8',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=60',
    modules: ['Components', 'JSX', 'Props', 'State']
  }
];

function q(selector) { return document.querySelector(selector); }
function qAll(selector) { return Array.from(document.querySelectorAll(selector)); }

/* Storage helpers */
function getPlayback(courseId){
  try{
    const raw = localStorage.getItem('course_playback_'+courseId);
    if(!raw) return {seconds:0,duration:0};
    const parsed = JSON.parse(raw);
    return {
      seconds: Number(parsed.seconds) || 0,
      duration: Number(parsed.duration) || 0
    };
  }catch(e){
    return {seconds:0,duration:0};
  }
}
function setPlayback(courseId, seconds, duration){
  const safeDuration = Math.max(0, Number(duration) || 0);
  const safeSeconds = Math.max(0, Math.min(Number(seconds) || 0, safeDuration || Number(seconds) || 0));
  localStorage.setItem('course_playback_'+courseId, JSON.stringify({seconds:safeSeconds,duration:safeDuration}));
}
function getCourseProgress(courseId){
  const {seconds,duration} = getPlayback(courseId);
  if(duration <= 0) return 0;
  return Math.min(100, Math.round((seconds/duration)*100));
}

function getCourseRating(courseId){
  try{
    const raw = localStorage.getItem('course_rating_'+courseId);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  }catch(e){return 0;}
}

function setCourseRating(courseId,value){
  localStorage.setItem('course_rating_'+courseId, String(value));
}

function setupNavToggle(){
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  if(!toggle || !nav) return;
  const closeMenu=()=>{
    toggle.setAttribute('aria-expanded','false');
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
  };
  toggle.addEventListener('click', ()=>{
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    toggle.setAttribute('aria-expanded', String(next));
    nav.classList.toggle('open', next);
    document.body.classList.toggle('nav-open', next);
  });
  nav.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', (evt)=>{
    if(evt.key === 'Escape'){
      closeMenu();
    }
  });
  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 760){
      closeMenu();
    }
  });
}

const youTubeInitCallbacks = [];
let youTubeApiRequested = false;
function ensureYouTubeIframeAPI(callback){
  if(window.YT && window.YT.Player){
    callback();
    return;
  }
  youTubeInitCallbacks.push(callback);
  if(youTubeApiRequested) return;
  youTubeApiRequested = true;
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}
window.onYouTubeIframeAPIReady = function(){
  while(youTubeInitCallbacks.length){
    const cb = youTubeInitCallbacks.shift();
    try{cb();}catch(e){console.error(e);}
  }
};

/* Home / Course list */
function renderCourseList(){
  const container = q('#courses');
  if(!container) return;
  container.innerHTML = '';
  COURSES.forEach(course => {
    const percent = getCourseProgress(course.id);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${course.image}" alt="${course.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/900x600/FF7A00/FFFFFF?text=${encodeURIComponent(course.title)}';">
      <h3>${course.title}</h3>
      <p class="small">${course.description}</p>
      <div class="meta"><span>${course.author}</span><span>${course.duration}</span></div>
      <div style="margin-bottom:8px"><div class="progress-wrap"><div class="progress" style="width:${percent}%"></div></div></div>
      <div class="actions">
        <a class="outline" href="course.html?id=${course.id}">Open Course</a>
        <a class="btn" href="course.html?id=${course.id}">Continue (${percent}%)</a>
      </div>
    `;
    container.appendChild(card);
  });
}


/* Course page */
function initCoursePage(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id) return;
  const course = COURSES.find(c=>c.id===id);
  if(!course) return;
  q('#course-title').textContent = course.title;
  q('#course-author').textContent = course.author + ' • ' + course.duration;
  q('#course-desc').textContent = course.description;
  const videoContainer = q('#video-embed');
  if(videoContainer){
    videoContainer.innerHTML = '<div class="small text-muted" style="padding:12px">Loading video...</div>';
  }

  const stars = qAll('#rating-stars .rating-star');
  const status = q('#rating-status');
  const ratingWrap = q('#rating-stars');
  let committedRating = getCourseRating(id);
  let playerInstance = null;
  let progressTimer = null;
  let lastSyncedSecond = 0;

  function setStatusMessage(value){
    if(!status) return;
    status.textContent = value ? `You rated this course ${value} star${value>1?'s':''}.` : 'Not rated yet';
  }

  function syncStars(value){
    stars.forEach(star=>{
      const starValue = Number(star.dataset.value);
      const isActive = starValue <= value;
      star.classList.toggle('active', isActive);
      star.classList.remove('preview');
      const isChecked = starValue === (value || 0);
      star.setAttribute('aria-checked', isChecked ? 'true' : 'false');
      star.setAttribute('tabindex', (value ? isChecked : starValue === 1) ? '0' : '-1');
    });
  }

  function previewStars(value){
    stars.forEach(star=>{
      const starValue = Number(star.dataset.value);
      star.classList.toggle('preview', starValue <= value);
    });
  }

  function clearPreview(){
    stars.forEach(star=>star.classList.remove('preview'));
  }

  function syncPlaybackFromPlayer(force=false){
    if(!playerInstance || typeof playerInstance.getDuration !== 'function') return;
    const duration = playerInstance.getDuration();
    if(!duration || Number.isNaN(duration)) return;
    const current = Math.min(duration, Math.max(0, playerInstance.getCurrentTime() || 0));
    if(!force && Math.abs(current - lastSyncedSecond) < 1) return;
    lastSyncedSecond = current;
    setPlayback(id, current, duration);
    updateCourseProgressUI(id);
  }

  function startProgressTracking(){
    stopProgressTracking();
    syncPlaybackFromPlayer(true);
    progressTimer = setInterval(()=>syncPlaybackFromPlayer(), 5000);
  }

  function stopProgressTracking(){
    if(progressTimer){
      clearInterval(progressTimer);
      progressTimer = null;
    }
    syncPlaybackFromPlayer(true);
  }

  function connectPlayer(){
    if(!videoContainer) return;
    ensureYouTubeIframeAPI(()=>{
      const existing = getPlayback(id);
      if(existing.seconds) lastSyncedSecond = existing.seconds;
      const playerVars = {rel:0, modestbranding:1, playsinline:1};
      const origin = window.location && window.location.origin;
      if(origin && window.location && /^https?:/.test(window.location.protocol)){
        playerVars.origin = origin;
      }
      playerInstance = new YT.Player('video-embed', {
        videoId: course.videoId,
        playerVars,
        events:{
          onReady:(event)=>{
            playerInstance = event.target;
            const duration = playerInstance.getDuration();
            if(duration){
              setPlayback(id, existing.seconds || 0, duration);
              if(existing.seconds && existing.seconds < duration - 5){
                playerInstance.seekTo(existing.seconds, true);
              }
            }
            updateCourseProgressUI(id);
            setTimeout(()=>syncPlaybackFromPlayer(true), 1200);
          },
          onStateChange:(event)=>{
            const state = event.data;
            if(state === YT.PlayerState.PLAYING){
              startProgressTracking();
            }else if(state === YT.PlayerState.PAUSED || state === YT.PlayerState.BUFFERING){
              stopProgressTracking();
            }else if(state === YT.PlayerState.ENDED){
              stopProgressTracking();
              const duration = playerInstance ? playerInstance.getDuration() : 0;
              if(duration){
                setPlayback(id, duration, duration);
                updateCourseProgressUI(id);
              }
            }
          }
        }
      });
    });
  }

  syncStars(committedRating);
  setStatusMessage(committedRating);

  stars.forEach(star=>{
    const value = Number(star.dataset.value);
    star.addEventListener('click', ()=>{
      committedRating = value;
      setCourseRating(id, committedRating);
      syncStars(committedRating);
      setStatusMessage(committedRating);
      updateCourseProgressUI(id);
    });
    star.addEventListener('mouseenter', ()=>previewStars(value));
    star.addEventListener('focus', ()=>previewStars(value));
    star.addEventListener('mouseleave', clearPreview);
    star.addEventListener('blur', clearPreview);
  });

  if(ratingWrap){
    ratingWrap.addEventListener('mouseleave', clearPreview);
    ratingWrap.addEventListener('keydown', (evt)=>{
      const keys = ['ArrowRight','ArrowUp','ArrowLeft','ArrowDown','Home','End'];
      if(!keys.includes(evt.key)) return;
      evt.preventDefault();
      let next = committedRating;
      if(evt.key==='ArrowRight' || evt.key==='ArrowUp'){
        next = Math.min(5, committedRating ? committedRating + 1 : 1);
      }else if(evt.key==='ArrowLeft' || evt.key==='ArrowDown'){
        next = committedRating ? Math.max(1, committedRating - 1) : 0;
      }else if(evt.key==='Home'){
        next = 1;
      }else if(evt.key==='End'){
        next = 5;
      }
      if(next===0) return;
      committedRating = next;
      setCourseRating(id, committedRating);
      syncStars(committedRating);
      setStatusMessage(committedRating);
      updateCourseProgressUI(id);
      const target = stars[committedRating-1];
      if(target) target.focus();
    });
  }

  if(videoContainer){
    connectPlayer();
    window.addEventListener('beforeunload', stopProgressTracking);
    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden){
        stopProgressTracking();
      }else if(playerInstance && window.YT && playerInstance.getPlayerState && playerInstance.getPlayerState() === YT.PlayerState.PLAYING){
        startProgressTracking();
      }
    });
  }

  updateCourseProgressUI(id);
}

function updateCourseProgressUI(courseId){
  const percent = getCourseProgress(courseId);
  const bar = q('#course-progress .progress');
  if(bar) bar.style.width = percent + '%';
  const pct = q('#course-progress-pct'); if(pct) pct.textContent = percent + '%';
}

/* Profile page */
function renderProfile(){
  const el = q('#profile-list');
  if(!el) return;
  el.innerHTML = '';
  let totalPercent = 0;
  COURSES.forEach(course=>{
    const percent = getCourseProgress(course.id);
    const row = document.createElement('div');
    row.className = 'card';
    row.style.display='flex';
    row.style.alignItems='center';
    row.style.gap='12px';
    row.innerHTML = `
      <img src="${course.image}" style="width:96px;height:60px;object-fit:cover;border-radius:6px" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200/FF7A00/FFFFFF?text=${encodeURIComponent(course.title)}';">
      <div style="flex:1">
        <div style="font-weight:600">${course.title}</div>
        <div class="small text-muted">${course.author}</div>
        <div style="margin-top:8px"><div class="progress-wrap"><div class="progress" style="width:${percent}%"></div></div></div>
      </div>
      <div style="min-width:70px;text-align:right">${percent}%</div>
    `;
    el.appendChild(row);
    totalPercent += percent;
  });
  const avg = COURSES.length ? Math.round(totalPercent / COURSES.length) : 0;
  const summary = document.getElementById('overall-progress');
  if(summary){ summary.textContent = 'Overall Average Progress: '+avg+'%'; }
}

/* Init */
document.addEventListener('DOMContentLoaded', ()=>{
  setupNavToggle();
  renderCourseList();
  if(q('#rating-stars')) initCoursePage();
  if(q('#profile-list')) renderProfile();
});
