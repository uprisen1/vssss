// ══════════════════════════════════════════════════════════════
//  GRABBER · app.js
//  Converts YouTube URLs to MP3 using RapidAPI (2 APIs with
//  automatic fallback). No redirects — silent blob download.
// ══════════════════════════════════════════════════════════════

const RKEY = '0a7fbf5f25msh8e4416481902fd0p194669jsn1a3c1fb44e48';

// ── DOM helpers ──────────────────────────────────────────────
const $    = id => document.getElementById(id);
const show = id => {
  ['s1','s2','s3','s4'].forEach(x => $(x).classList.add('hidden'));
  $(id).classList.remove('hidden');
};

let mp3Link  = '';
let mp3Title = 'audio';

// ── Extract YouTube video ID from any URL ────────────────────
function getVid(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2];
    return u.searchParams.get('v') || null;
  } catch { return null; }
}

// ── Try both APIs in order until one returns a link ──────────
async function tryAPIs(vid) {

  // API 1: youtube-mp36 by ytjar
  try {
    $('loadMsg').textContent = 'Converting… (method 1/2)';
    let d = await (await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${vid}`, {
      headers: {
        'x-rapidapi-key':  RKEY,
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
      }
    })).json();

    // Poll while server is still processing
    for (let i = 0; i < 8 && d?.status === 'processing'; i++) {
      await sleep(2500);
      d = await (await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${vid}`, {
        headers: {
          'x-rapidapi-key':  RKEY,
          'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
        }
      })).json();
    }
    if (d?.status === 'ok' && d?.link?.startsWith('http')) {
      return { link: d.link, title: d.title || '' };
    }
  } catch {}

  // API 2: youtube-to-mp315 by marcocollatina
  try {
    $('loadMsg').textContent = 'Converting… (method 2/2)';
    const d = await (await fetch(`https://youtube-to-mp315.p.rapidapi.com/dl?id=${vid}`, {
      headers: {
        'x-rapidapi-key':  RKEY,
        'x-rapidapi-host': 'youtube-to-mp315.p.rapidapi.com'
      }
    })).json();
    const link = d?.link || d?.url || d?.download_url;
    if (link && link.startsWith('http')) {
      return { link, title: d?.title || '' };
    }
  } catch {}

  return null; // Both APIs failed
}

// ── Utilities ────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function clean(s) {
  return (s || 'audio').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '').trim() || 'audio';
}

function shake(el) {
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shake .35s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

// ── CONVERT: fetch video info + MP3 link ────────────────────
async function doConvert() {
  const raw = $('urlInput').value.trim();
  if (!raw) { shake($('urlInput')); return; }

  const vid = getVid(raw);
  if (!vid) {
    fail("Doesn't look like a YouTube URL. Please check and try again.");
    return;
  }

  show('s2');
  $('loadMsg').textContent = 'Getting video info…';

  // Fetch title & thumbnail via YouTube oEmbed (CORS-free, always works)
  let title = 'YouTube Video';
  let thumb = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
  try {
    const oe = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`
    );
    if (oe.ok) {
      const d = await oe.json();
      title = d.title || title;
      thumb = d.thumbnail_url || thumb;
    }
  } catch {}

  const result = await tryAPIs(vid);

  if (!result) {
    fail('Conversion failed. Please check your connection and try again. The video may be unavailable or region-locked.');
    return;
  }

  mp3Link  = result.link;
  mp3Title = result.title || title;

  $('tImg').src            = thumb;
  $('rTitle').textContent  = result.title || title;
  show('s3');
}

// ── DOWNLOAD: silent blob download, button turns green ───────
async function doDownload() {
  if (!mp3Link) return;

  const btn = $('dlBtn');
  const lbl = $('dlLbl');

  // Instantly go green + pulse
  btn.setAttribute('disabled', '');
  btn.classList.add('going');
  lbl.innerHTML = 'Downloading…';

  try {
    const res = await fetch(mp3Link);
    if (!res.ok) throw new Error('link_expired');
    const blob = await res.blob();

    // Trigger silent save dialog — no new tab opened
    const url = URL.createObjectURL(blob);
    const a   = Object.assign(document.createElement('a'), {
      href: url,
      download: clean(mp3Title) + '.mp3'
    });
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    // Show green tick (done state)
    btn.classList.remove('going');
    btn.classList.add('done');
    $('ico').innerHTML = `<polyline points="20 6 9 17 4 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    lbl.innerHTML = 'Done!';

    // Reset back to red after 5 seconds
    setTimeout(() => {
      btn.classList.remove('done');
      btn.removeAttribute('disabled');
      $('ico').innerHTML = `
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none"/>
        <polyline points="7 10 12 15 17 10" fill="none"/>
        <line x1="12" y1="15" x2="12" y2="3"/>`;
      lbl.innerHTML = 'Download<br/>MP3';
    }, 5000);

  } catch (e) {
    btn.classList.remove('going');
    btn.removeAttribute('disabled');
    lbl.innerHTML = 'Download<br/>MP3';

    if (e.message === 'link_expired') {
      fail('Download link expired. Please tap "Convert another" and try again.');
    } else {
      // Last resort: open link directly
      window.open(mp3Link, '_blank');
      btn.classList.add('done');
      lbl.innerHTML = 'Opening…';
      setTimeout(() => { btn.classList.remove('done'); lbl.innerHTML = 'Download<br/>MP3'; }, 4000);
    }
  }
}

function fail(msg)  { $('eMsg').textContent = msg; show('s4'); }
function reset()    { mp3Link = ''; mp3Title = 'audio'; $('urlInput').value = ''; show('s1'); $('urlInput').focus(); }

// ── Event listeners ──────────────────────────────────────────
$('cvBtn').addEventListener('click', doConvert);
$('urlInput').addEventListener('keydown', e => { if (e.key === 'Enter') doConvert(); });
$('dlBtn').addEventListener('click', doDownload);
$('backBtn').addEventListener('click', reset);
$('errBack').addEventListener('click', reset);
