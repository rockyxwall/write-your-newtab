function pad(n) {
  return n.toString().padStart(2, '0');
}

function updateClock() {
  const now = new Date();
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  if (!timeEl || !dateEl) return;
  timeEl.textContent = h + ':' + m;
  const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString(undefined, opts);
}

updateClock();
setInterval(updateClock, 1000);

