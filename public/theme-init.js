// Blocking theme initializer — runs before CSS/React to prevent white flash.
// Placed in public/ so WXT copies it as-is (MV3 CSP compliant: script-src 'self').
(function () {
  var theme = localStorage.getItem('wyn-theme');
  if (
    theme === 'dark' ||
    (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  }
})();
