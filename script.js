"use strict";

// لیست آهنگ‌ها — فایل‌ها توی پوشهٔ songs/
const SONGS = [
  { title: "حنا خانوم", artist: "ابی", src: "songs/1.mp3" },
  { title: "یار چیش قشنگ (نسخهٔ پیانو)", artist: "ممرز", src: "songs/2.mp3" },
  { title: "آره منم دوستت دارم", artist: "ناشناس", src: "songs/3.mp3" },
  { title: "نمی‌خواستم", artist: "علی یاسینی", src: "songs/4.mp3" },
  { title: "قتل عمد", artist: "Dorcci", src: "songs/5.mp3" },
];

const $ = (id) => document.getElementById(id);
const fa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

/* ---------------- صفحهٔ اول: خطبهٔ عقد ---------------- */
const pageAghd = $("page-aghd");
const pageJashn = $("page-jashn");
const btnNo = $("btn-no");
const btnYes = $("btn-yes");
const toast = $("toast");
const roundNote = $("round-note");

const NO_TEXTS = ["مطمئنی؟", "یه بار دیگه فکر کن", "دلمو شکستی 💔", "حنا جان…", "دیگه داره غیب میشه", "😢"];
const YES_STEPS = [
  { toast: "عروس رفته گل بچینه 🌸", note: "برای بار دوم عرض می‌کنم… آیا وکیلم؟" },
  { toast: "عروس رفته گلاب بیاره 🌹", note: "برای بار سوم و آخر عرض می‌کنم… آیا وکیلم؟" },
];

let noScale, yesScale, noClicks, yesClicks;

function showToast(text) {
  toast.textContent = text;
  toast.classList.remove("show");
  void toast.offsetWidth; // ری‌استارت انیمیشن
  toast.classList.add("show");
}

function resetAghd() {
  noScale = 1;
  yesScale = 1;
  noClicks = 0;
  yesClicks = 0;
  btnNo.textContent = "خیر";
  btnNo.classList.remove("gone");
  btnNo.style.setProperty("--s", 1);
  btnYes.style.setProperty("--s", 1);
  toast.textContent = "";
  toast.classList.remove("show");
  roundNote.textContent = "";
}

btnNo.addEventListener("click", () => {
  noScale *= 0.78;
  yesScale = Math.min(yesScale * 1.15, 1.9);
  btnYes.style.setProperty("--s", yesScale);

  if (noScale < 0.22) {
    btnNo.classList.add("gone");
    showToast("دیگه راه فرار نداری 😌");
    return;
  }
  btnNo.style.setProperty("--s", noScale);
  btnNo.textContent = NO_TEXTS[Math.min(noClicks, NO_TEXTS.length - 1)];
  noClicks++;
});

btnYes.addEventListener("click", () => {
  if (yesClicks < YES_STEPS.length) {
    const step = YES_STEPS[yesClicks++];
    showToast(step.toast);
    roundNote.textContent = step.note;
    return;
  }
  // کلیک سوم: قبول! پخش باید همین‌جا، داخل همین کلیک، شروع بشه
  goToJashn();
});

/* ---------------- صفحهٔ دوم: جشن ---------------- */
function goToJashn() {
  pageAghd.hidden = true;
  pageJashn.hidden = false;
  window.scrollTo(0, 0);
  if (SONGS.length) playIndex(0);
  petals.start();
}

$("btn-again").addEventListener("click", () => {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  current = -1;
  updateNow();
  petals.stop();
  resetAghd();
  pageJashn.hidden = true;
  pageAghd.hidden = false;
  window.scrollTo(0, 0);
});

/* ---------------- پلیر موزیک ---------------- */
const audio = $("audio");
const vinyl = $("vinyl");
const arm = $("arm");
const btnPlay = $("btn-play");
const seek = $("seek");
const tCur = $("t-cur");
const tDur = $("t-dur");
const playlist = $("playlist");
let current = -1;
let seeking = false;

function fmt(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return fa(m + ":" + String(s).padStart(2, "0"));
}

function buildPlaylist() {
  playlist.innerHTML = "";
  if (!SONGS.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "به‌زودی آهنگ‌ها اضافه می‌شن 🎶";
    playlist.appendChild(li);
    return;
  }
  SONGS.forEach((song, i) => {
    const li = document.createElement("li");
    li.innerHTML = '<span class="num"></span><span class="meta"><div class="t"></div><div class="a"></div></span>';
    li.querySelector(".num").textContent = fa(i + 1);
    li.querySelector(".t").textContent = song.title;
    li.querySelector(".a").textContent = song.artist;
    li.addEventListener("click", () => playIndex(i));
    playlist.appendChild(li);
  });
}

function updateNow() {
  const song = SONGS[current];
  $("now-title").textContent = song ? song.title : "—";
  $("now-artist").textContent = song ? song.artist : "—";
  [...playlist.children].forEach((li, i) => li.classList.toggle("active", i === current));
  seek.value = 0;
  tCur.textContent = fmt(0);
  tDur.textContent = fmt(0);
}

function playIndex(i) {
  if (!SONGS.length) return;
  current = (i + SONGS.length) % SONGS.length;
  audio.src = SONGS[current].src;
  updateNow();
  audio.play().catch(() => {});
}

function togglePlay() {
  if (!SONGS.length) return;
  if (current < 0) return playIndex(0);
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

function setPlayingUI(on) {
  vinyl.classList.toggle("playing", on);
  arm.classList.toggle("on", on);
  btnPlay.classList.toggle("playing", on);
  btnPlay.setAttribute("aria-label", on ? "توقف" : "پخش");
}

btnPlay.addEventListener("click", togglePlay);
$("btn-prev").addEventListener("click", () => {
  if (audio.currentTime > 3 && current >= 0) audio.currentTime = 0;
  else playIndex(current - 1);
});
$("btn-next").addEventListener("click", () => playIndex(current + 1));

audio.addEventListener("play", () => setPlayingUI(true));
audio.addEventListener("pause", () => setPlayingUI(false));
audio.addEventListener("ended", () => playIndex(current + 1));
audio.addEventListener("loadedmetadata", () => { tDur.textContent = fmt(audio.duration); });
audio.addEventListener("timeupdate", () => {
  if (seeking || !audio.duration) return;
  seek.value = (audio.currentTime / audio.duration) * 100;
  tCur.textContent = fmt(audio.currentTime);
});

seek.addEventListener("input", () => {
  seeking = true;
  if (audio.duration) tCur.textContent = fmt((seek.value / 100) * audio.duration);
});
seek.addEventListener("change", () => {
  if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
  seeking = false;
});

/* ---------------- بارش گلبرگ‌ها ---------------- */
const petals = (() => {
  const canvas = $("petals");
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const COLORS = ["#ff4d6d", "#ff8fab", "#ffb3c6", "#f6dd8f", "#d4a64a", "#ffffff", "#c9184a"];
  let items = [];
  let raf = 0;
  let w = 0;
  let h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(top) {
    return {
      x: Math.random() * w,
      y: top ? -20 - Math.random() * h : Math.random() * h,
      r: 5 + Math.random() * 7,
      vy: 0.6 + Math.random() * 1.3,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.02,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.06,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, -p.r);
    ctx.bezierCurveTo(p.r * 0.9, -p.r * 0.6, p.r * 0.7, p.r * 0.8, 0, p.r);
    ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.8, -p.r * 0.9, -p.r * 0.6, 0, -p.r);
    ctx.fill();
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of items) {
      p.sway += p.swaySpeed;
      p.x += Math.sin(p.sway) * 0.8;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > h + 20) Object.assign(p, spawn(true), { y: -20 });
      drawPetal(p);
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduce.matches || raf) return;
    resize();
    const count = Math.round(Math.min(70, w / 6));
    items = Array.from({ length: count }, () => spawn(true));
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    items = [];
    ctx.clearRect(0, 0, w, h);
  }

  window.addEventListener("resize", () => { if (raf) resize(); });
  reduce.addEventListener?.("change", () => { if (reduce.matches) stop(); });

  return { start, stop };
})();

/* ---------------- شروع ---------------- */
resetAghd();
buildPlaylist();
