export default defineBackground(() => {
  // console.log('Hello background!', { id: browser.runtime.id });

  // popup to direct open full page.
  browser.action.onClicked.addListener(async () => {
    const url = browser.runtime.getURL('/dashboard.html');
    const tabs = await browser.tabs.query({ url });
    if (tabs.length > 0) {
      browser.tabs.update(tabs[0].id!, { active: true });
    } else {
      browser.tabs.create({ url });
    }
  });

  // browser.action.onClicked.addListener(() => {
  //   browser.tabs.create({ url: browser.runtime.getURL('/dashboard.html') })
  // })
});
