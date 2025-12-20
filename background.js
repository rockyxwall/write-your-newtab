chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: './settings/pages/index.html' });
});