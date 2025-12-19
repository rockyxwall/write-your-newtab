const htmlEditor = document.getElementById("html-editor");
const cssEditor = document.getElementById("css-editor");
const jsEditor = document.getElementById("js-editor");
const preview = document.getElementById("preview");
const previewSection = document.getElementById("preview-section");
const tabs = document.querySelectorAll(".tab");
const editors = document.querySelectorAll(".editor");

// Load saved code
chrome.storage.local.get(["html", "css", "js"], (result) => {
  htmlEditor.value = result.html || "";
  cssEditor.value = result.css || "";
  jsEditor.value = result.js || "";
});

// Tab switching
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.tab;
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    editors.forEach((e) => e.classList.add("hidden"));
    document.getElementById(`${tabName}-editor`).classList.remove("hidden");
  });
});

// Save button
document.getElementById("save-btn").addEventListener("click", () => {
  chrome.storage.local.set(
    {
      html: htmlEditor.value,
      css: cssEditor.value,
      js: jsEditor.value,
    },
    () => {
      alert("Code saved! Open a new tab to see your changes.");
    }
  );
});

// Preview button
document.getElementById("preview-btn").addEventListener("click", () => {
  previewSection.classList.remove("hidden");
  runPreview();
});

// Close preview button
document.getElementById("close-preview").addEventListener("click", () => {
  previewSection.classList.add("hidden");
});

function runPreview() {
  const htmlCode = htmlEditor.value;
  const cssCode = `<style>${cssEditor.value}</style>`;
  const jsCode = `<script>${jsEditor.value}<\/script>`;

  const code = htmlCode + cssCode + jsCode;
  preview.srcdoc = code;
}

// Export button
document.getElementById("export-btn").addEventListener("click", () => {
  const data = {
    html: htmlEditor.value,
    css: cssEditor.value,
    js: jsEditor.value,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "newtab-code.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import button
document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("file-input").click();
});

document.getElementById("file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        htmlEditor.value = data.html || "";
        cssEditor.value = data.css || "";
        jsEditor.value = data.js || "";
        alert("Code imported successfully!");
      } catch (error) {
        alert("Invalid file format!");
      }
    };
    reader.readAsText(file);
  }
});
