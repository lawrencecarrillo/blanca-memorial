// ── Navigation ──────────────────────────────────────────────
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'memories') loadMemories();
  if (id === 'gallery') loadGallery();
}

// ── Helpers ─────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showMsg(id, duration = 4500) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', duration);
}

// ── Gallery ─────────────────────────────────────────────────
let galleryPhotos = [];
let curIdx = 0;

async function loadGallery() {
  try {
    const res = await fetch('/api/gallery');
    galleryPhotos = await res.json();
    renderGallery();
  } catch (e) {
    document.getElementById('gallery-grid').innerHTML =
      '<div class="gallery-empty">Could not load photos. Please refresh.</div>';
  }
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!galleryPhotos || galleryPhotos.length === 0) {
    grid.innerHTML = '<div class="gallery-empty">No photos yet. Be the first to add one below.</div>';
    return;
  }
  grid.innerHTML = '';
  galleryPhotos.forEach((photo, i) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.onclick = () => openLightbox(i);
    div.innerHTML = `
      <img src="${esc(photo.url)}" alt="${esc(photo.caption || 'Blanca')}" loading="lazy"/>
      ${photo.caption ? `<div class="gallery-caption">${esc(photo.caption)}</div>` : ''}
    `;
    grid.appendChild(div);
  });
}



// ── Lightbox ─────────────────────────────────────────────────
function openLightbox(i) {
  curIdx = i;
  updateLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.getElementById('lightbox').style.display = 'flex';
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
  document.getElementById('lightbox').classList.remove('open');
}

function changeLightbox(dir) {
  curIdx = (curIdx + dir + galleryPhotos.length) % galleryPhotos.length;
  updateLightbox();
}

function updateLightbox() {
  const photo = galleryPhotos[curIdx];
  document.getElementById('lightbox-img').src = photo.url;
  document.getElementById('lightbox-label').textContent = photo.caption || '';
  document.getElementById('lightbox-counter').textContent = (curIdx + 1) + ' of ' + galleryPhotos.length;
}

document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});

document.addEventListener('keydown', function(e) {
  if (document.getElementById('lightbox').style.display === 'flex') {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightbox(-1);
    if (e.key === 'ArrowRight') changeLightbox(1);
  }
});

// ── Memories ─────────────────────────────────────────────────
async function loadMemories() {
  const cards = document.getElementById('memory-cards');
  try {
    const res = await fetch('/api/memories');
    const memories = await res.json();
    cards.innerHTML = '';
    if (!memories || memories.length === 0) {
      cards.innerHTML = '<div class="memory-empty">Be the first to share a memory of Blanca.</div>';
      return;
    }
    memories.forEach(m => cards.appendChild(makeCard(m)));
  } catch (e) {
    cards.innerHTML = '<div class="memory-empty">Could not load memories. Please refresh.</div>';
  }
}

function makeCard(m) {
  const div = document.createElement('div');
  div.className = 'memory-card';
  div.innerHTML = `
    <div class="memory-card-name">
      ${esc(m.name)}
      ${m.relation ? ` &nbsp;&middot;&nbsp; <span class="memory-card-relation">${esc(m.relation)}</span>` : ''}
    </div>
    <div class="memory-card-date">${esc(m.date)}</div>
    <div class="memory-card-text">${esc(m.text).replace(/\n/g, '<br>')}</div>
  `;
  return div;
}

async function submitMemory() {
  const name = document.getElementById('mem-name').value.trim();
  const relation = document.getElementById('mem-relation').value.trim();
  const text = document.getElementById('mem-text').value.trim();

  if (!name || !text) {
    alert('Please enter your name and a memory before submitting.');
    return;
  }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, relation, text })
    });
    if (!res.ok) throw new Error('Failed');

    document.getElementById('mem-name').value = '';
    document.getElementById('mem-relation').value = '';
    document.getElementById('mem-text').value = '';
    showMsg('success-msg');
    loadMemories();
    document.getElementById('memory-cards').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    showMsg('error-msg');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Share Memory';
  }
}

// ── Init ─────────────────────────────────────────────────────
window.addEventListener('load', () => {
  loadGallery();
});
