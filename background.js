/**
 * background.js — The Service Worker
 *
 * WHAT IS A SERVICE WORKER?
 * Think of this as a tiny background helper that runs behind the scenes.
 * It doesn't have a visible window. It wakes up when needed (e.g., when you
 * click the extension icon), does its job, then goes back to sleep.
 * Chrome requires Manifest V3 extensions to use service workers instead of
 * the old "background pages."
 *
 * THIS FILE'S ONE JOB:
 * When the user clicks the TabCraft icon in the toolbar, open the dashboard
 * in a new tab. That's it!
 */

// chrome.action.onClicked is an EVENT LISTENER.
// It's like saying: "Hey Chrome, whenever someone clicks my extension icon,
// run this function."
chrome.action.onClicked.addListener(function () {

  // chrome.tabs.create opens a new browser tab.
  // We pass it an object { url: "..." } to tell it WHAT to open.
  // "dashboard.html" is a file that lives inside our extension's own folder,
  // so we reference it directly by name.
  chrome.tabs.create({ url: "dashboard.html" });

});
