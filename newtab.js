chrome.storage.local.get(["html", "css", "js"], (result) => {
  const htmlCode = result.html || "";
  const cssCode = result.css || "";
  const jsCode = result.js || "";

  // Inject CSS
  if (cssCode) {
    const style = document.createElement("style");
    style.textContent = cssCode;
    document.head.appendChild(style);
  }

  // Inject HTML
  if (htmlCode) {
    document.body.innerHTML = htmlCode;
  }

  // Inject JS
  if (jsCode) {
    const script = document.createElement("script");
    script.textContent = jsCode;
    document.body.appendChild(script);
  }
});
