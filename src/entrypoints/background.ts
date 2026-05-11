export default defineBackground(() => {
  // Open onboarding on install
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      browser.tabs.create({ url: browser.runtime.getURL('/onboarding.html') });
    }
  });

  browser.action.onClicked.addListener(async (activeTab) => {
    const dashboardUrl = browser.runtime.getURL('/dashboard.html');

    try {
      // Try to find if the dashboard is already open
      const tabs = await browser.tabs.query({ windowType: 'normal' });
      const existingTab = tabs.find(tab => tab.url === dashboardUrl);

      if (existingTab && existingTab.id !== undefined) {
        await browser.tabs.update(existingTab.id, { active: true });
        if (existingTab.windowId !== undefined) {
          await browser.windows.update(existingTab.windowId, { focused: true });
        }
      } else {
        await browser.tabs.create({ url: dashboardUrl });
      }
    } catch (error) {
      // Fallback: if query fails for any reason, just open a new tab
      await browser.tabs.create({ url: dashboardUrl });
    }
  });
});
