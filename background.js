const URL_PATTERN = /^https:\/\/dofusdb\.fr\/fr\/database\/(dungeon|quest)\/\d+(\?.*)?$/;
const mapping = {};

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
		}, 5000);
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

fetch("https://raw.githubusercontent.com/AntoninHuaut/DofusNoobsIdentifier/refs/heads/master/mapping.json")
	.then(response => response.json())
	.then(data => {
		for (const [key, value] of Object.entries(data)) {
			mapping[key] = value;
		}
	})
	.catch(error => console.error("Error loading JSON:", error));

chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs.length === 0) return;

		sendRedirectMessage(tabs[0].id);
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.url) {
		checkAndExecute(tabId, changeInfo.url);
	}
});

chrome.tabs.onCreated.addListener((tab) => {
	if (tab.pendingUrl) {
		checkAndExecute(tab.id, tab.pendingUrl);
	} else if (tab.url) {
		checkAndExecute(tab.id, tab.url);
	}
});