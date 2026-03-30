export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });


  browser.action.onClicked.addListener(async () => {
    // WXT flattens entrypoints, so dashboard.html is at the root
    const url = browser.runtime.getURL('/dashboard.html');
    
    // Logic to either open a new tab or focus the existing one
    const tabs = await browser.tabs.query({ url });
    if (tabs.length > 0) {
      browser.tabs.update(tabs[0].id!, { active: true });
    } else {
      browser.tabs.create({ url });
    }
  });
});
