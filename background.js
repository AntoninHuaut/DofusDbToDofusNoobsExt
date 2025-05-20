const URL_PATTERN = /^https:\/\/dofusdb\.fr\/fr\/database\/(dungeon|quest)\/\d+(\?.*)?$/;
const mapping = {};
const mapping_alarm = "mapping-alarm";

retrieveMapping();
async function retrieveMapping() {
	try {
		const response = await fetch("https://raw.githubusercontent.com/AntoninHuaut/DofusNoobsIdentifier/refs/heads/master/storage/mapping.json");
		const data = await response.json();
		for (const [key, value] of Object.entries(data)) {
			mapping[key] = value;
		}
	} catch (err) {
		console.error("Error loading JSON:", err)
	}
}
chrome.runtime.onInstalled.addListener(() => {
	chrome.alarms.create(mapping_alarm, { periodInMinutes: 60 * 24 });
});
chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === mapping_alarm) retrieveMapping();
});

function waitForTabReady(tabId) {
	return new Promise((resolve, reject) => {
		const intervalId = setInterval(() => {
			chrome.tabs.get(tabId, (tab) => {
				if (tab.status === "complete") {
					clearInterval(intervalId);
					resolve(tab);
				}
			});
		}, 100);

		setTimeout(() => { 	// In case tab is never ready
			clearInterval(intervalId);
			reject("timeout");
		}, 30000);
	});
}

function checkAndExecute(tabId, url) {
	const match = url.match(URL_PATTERN);
	if (!match) return;

	chrome.storage.local.get(["autoRedirectDungeons", "autoRedirectQuests"], (data) => {
		const autoRedirectDungeons = data?.autoRedirectDungeons ?? false;
		const autoRedirectQuests = data?.autoRedirectQuests ?? false;

		const type = match[1];
		const shouldRedirect = (type === 'dungeon' && autoRedirectDungeons) || (type === 'quest' && autoRedirectQuests);
		if (!shouldRedirect) return;

		waitForTabReady(tabId).then((tab) => sendRedirectMessage(tabId)).catch((error) => console.error(error));
	});
}

function sendRedirectMessage(tabId) {
	chrome.tabs.sendMessage(tabId, { action: "redirectDofusNoobs", mapping });
}

(chrome.browserAction ?? chrome.action /* MV2 vs MV3 */).onClicked.addListener(() => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs.length === 0) return;
		sendRedirectMessage(tabs[0].id);
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.url) checkAndExecute(tabId, changeInfo.url);
});

chrome.tabs.onCreated.addListener((tab) => {
	if (tab.pendingUrl) checkAndExecute(tab.id, tab.pendingUrl);
	else if (tab.url) checkAndExecute(tab.id, tab.url);
});