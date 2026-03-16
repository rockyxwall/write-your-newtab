/**
 * defaults.js — Pre-Installed Templates
 *
 * WHAT IS THIS FILE?
 * This file stores 3 beautiful starter templates as JavaScript strings.
 * When someone installs TabCraft for the first time, instead of seeing a
 * blank white screen, they immediately have 3 ready-to-use tab designs.
 *
 * WHY STORE HTML AS STRINGS?
 * Chrome storage saves data as text (strings). So we write each template's
 * full HTML code as a big text string. Later, we inject this string directly
 * into the page.
 *
 * THE `const` KEYWORD means "this value will never be reassigned."
 * It's safer than `var` or `let` when the value shouldn't change.
 *
 * BACKTICK STRINGS (`) are called "template literals."
 * They let us write multi-line strings without any tricks.
 * Regular strings use "quotes" and can't span multiple lines.
 */

const DEFAULT_TEMPLATES = [

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE 1: Minimalist Clock
  // A large, centered clock with a soft gradient background.
  // ─────────────────────────────────────────────────────────────
  {
    id: "default-clock",          // Unique ID used to identify this template in storage
    name: "Minimalist Clock",     // Human-readable name shown in the dashboard
    isDefault: true,              // Marks this as a built-in (not user-uploaded) template
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Clock</title>
  <style>
    /* CSS RESET: Remove default browser spacing */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      /* min-height: 100dvh means "fill the full visible screen height" */
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;      /* Center horizontally */
      justify-content: center;  /* Center vertically */
      /* A subtle purple-to-blue gradient background */
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      font-family: 'Courier New', monospace;
      color: #fff;
      overflow: hidden;
    }

    /* The big clock number display */
    #clock {
      font-size: clamp(4rem, 15vw, 10rem); /* Scales with screen width */
      font-weight: 100;   /* Ultra-thin text */
      letter-spacing: 0.05em;
      text-shadow: 0 0 60px rgba(180, 160, 255, 0.5); /* Soft glow */
      /* CSS animation: fade in on load */
      animation: fadeIn 1.2s ease forwards;
    }

    /* Today's date, shown below the clock */
    #date {
      margin-top: 1rem;
      font-size: clamp(0.9rem, 2vw, 1.3rem);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      opacity: 0.5;
      animation: fadeIn 1.8s ease forwards;
    }

    /* A soft breathing glow circle behind the clock */
    body::before {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(120, 80, 255, 0.15), transparent 70%);
      animation: pulse 4s ease-in-out infinite;
      pointer-events: none; /* Don't block mouse clicks */
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.15); }
    }
  </style>
</head>
<body>
  <div id="clock">00:00:00</div>
  <div id="date">Loading...</div>

  <script>
    // This function runs every second to update the clock
    function updateClock() {
      const now = new Date(); // Get the current date and time

      // Pad numbers with leading zeros: "9" becomes "09"
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');

      document.getElementById('clock').textContent = h + ':' + m + ':' + s;

      // Format the date nicely: "Monday, January 1, 2025"
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      document.getElementById('date').textContent = now.toLocaleDateString(undefined, options);
    }

    updateClock(); // Run immediately on load (don't wait 1 second)
    setInterval(updateClock, 1000); // Then repeat every 1000ms = 1 second
  </script>
</body>
</html>`
  },

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE 2: Focus Mode
  // A minimal "What is your main focus today?" prompt.
  // The user can type their intention and it saves in the browser.
  // ─────────────────────────────────────────────────────────────
  {
    id: "default-focus",
    name: "Focus Mode",
    isDefault: true,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Focus</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0d0d0d;
      font-family: Georgia, 'Times New Roman', serif;
      color: #e8e8e0;
    }

    .container {
      text-align: center;
      padding: 2rem;
      animation: riseIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    /* The small label above the input */
    .label {
      font-size: clamp(0.7rem, 1.5vw, 0.9rem);
      letter-spacing: 0.4em;
      text-transform: uppercase;
      opacity: 0.4;
      margin-bottom: 2rem;
    }

    /* The text input field */
    #focus-input {
      background: transparent;       /* No background color */
      border: none;                   /* No border */
      border-bottom: 1px solid rgba(255,255,255,0.2); /* Just a bottom line */
      color: #fff;
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-family: inherit;           /* Use same font as body */
      text-align: center;
      width: clamp(300px, 60vw, 700px);
      padding: 0.5rem 0;
      outline: none;                  /* Remove the default blue focus ring */
      transition: border-color 0.3s ease;
    }

    /* Style change when the input is focused (user is typing) */
    #focus-input:focus {
      border-bottom-color: rgba(255,255,255,0.6);
    }

    /* Placeholder text color */
    #focus-input::placeholder { color: rgba(255,255,255,0.2); }

    .hint {
      margin-top: 1.5rem;
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      opacity: 0.2;
      text-transform: uppercase;
    }

    @keyframes riseIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="container">
    <p class="label">What is your main focus today?</p>
    <!-- The input where users type their focus. autofocus opens keyboard immediately -->
    <input id="focus-input" type="text" placeholder="Type it here..." autofocus>
    <p class="hint">Press Enter to save</p>
  </div>

  <script>
    const input = document.getElementById('focus-input');

    // When the page loads, check if there was a saved focus from before
    // localStorage is like a tiny notebook built into the browser
    const savedFocus = localStorage.getItem('tabcraft-focus');
    if (savedFocus) {
      input.value = savedFocus;
    }

    // Save the text when the user presses Enter
    input.addEventListener('keydown', function(event) {
      // event.key tells us which key was pressed
      if (event.key === 'Enter') {
        localStorage.setItem('tabcraft-focus', input.value);
        input.blur(); // Remove focus from the input (hide the cursor)
      }
    });

    // Also save automatically as the user types (every keystroke)
    input.addEventListener('input', function() {
      localStorage.setItem('tabcraft-focus', input.value);
    });
  </script>
</body>
</html>`
  },

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE 3: Terminal Dashboard
  // A hacker-aesthetic dark terminal with time and quick links.
  // ─────────────────────────────────────────────────────────────
  {
    id: "default-terminal",
    name: "Terminal",
    isDefault: true,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Terminal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100dvh;
      background: #0a0e0a;
      /* "monospace" means every character is the same width — classic terminal look */
      font-family: 'Courier New', Courier, monospace;
      color: #00ff41;  /* Classic green terminal color */
      padding: 2rem;
      /* CRT scan-line effect using a repeating gradient */
      background-image: repeating-linear-gradient(
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.08) 2px,
        rgba(0, 0, 0, 0.08) 4px
      );
    }

    .terminal-window {
      max-width: 800px;
      margin: 0 auto;
      animation: bootUp 0.6s ease forwards;
    }

    /* The green top bar with the window title */
    .terminal-header {
      background: #00ff41;
      color: #0a0e0a;
      padding: 0.3rem 1rem;
      font-size: 0.85rem;
      font-weight: bold;
      letter-spacing: 0.1em;
      margin-bottom: 1.5rem;
    }

    /* Each line that appears as if "typed" */
    .line {
      margin-bottom: 0.5rem;
      font-size: clamp(0.75rem, 1.5vw, 0.95rem);
      line-height: 1.6;
    }

    .prompt { color: #00cc33; opacity: 0.7; }  /* The "> " part */
    .output { color: #88ff99; opacity: 0.8; }  /* Output lines */
    .highlight { color: #ffffff; }              /* White for emphasis */
    .dim { opacity: 0.4; }                      /* Faded text */

    /* Quick links section */
    .links-section { margin-top: 2rem; }

    .link-item {
      display: inline-block;
      margin: 0.3rem 1rem 0.3rem 0;
    }

    /* The actual clickable links */
    .link-item a {
      color: #00ff41;
      text-decoration: none;
      border-bottom: 1px solid rgba(0,255,65,0.3);
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .link-item a:hover {
      color: #fff;
      border-bottom-color: #fff;
    }

    /* Blinking cursor animation */
    .cursor {
      display: inline-block;
      width: 0.6em;
      height: 1em;
      background: #00ff41;
      vertical-align: text-bottom;
      animation: blink 1s step-end infinite; /* "step-end" = snap, not fade */
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }

    @keyframes bootUp {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="terminal-window">
    <div class="terminal-header">TABCRAFT TERMINAL v1.0.0</div>

    <div class="line"><span class="prompt">&gt; </span><span class="output">system.boot() — OK</span></div>
    <div class="line"><span class="prompt">&gt; </span><span class="output">user.session — <span class="highlight">ACTIVE</span></span></div>
    <div class="line"><span class="prompt">&gt; </span><span class="output">timestamp — <span id="ts" class="highlight">...</span></span></div>
    <div class="line dim"><span class="prompt">&gt; </span><span class="output">───────────────────────────────</span></div>

    <div class="links-section">
      <div class="line"><span class="prompt">&gt; </span><span class="output">quick.links —</span></div>
      <!-- You can edit these links to your own favourite sites -->
      <div class="link-item"><a href="https://github.com" target="_blank">[ github ]</a></div>
      <div class="link-item"><a href="https://news.ycombinator.com" target="_blank">[ hackernews ]</a></div>
      <div class="link-item"><a href="https://reddit.com" target="_blank">[ reddit ]</a></div>
      <div class="link-item"><a href="https://developer.mozilla.org" target="_blank">[ mdn ]</a></div>
    </div>

    <div class="line" style="margin-top: 2rem;">
      <span class="prompt">&gt; </span><span class="cursor"></span>
    </div>
  </div>

  <script>
    // Update the timestamp every second
    function updateTimestamp() {
      const now = new Date();
      document.getElementById('ts').textContent = now.toLocaleString();
    }
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
  </script>
</body>
</html>`
  }

];
