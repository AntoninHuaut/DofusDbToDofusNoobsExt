const mapping = {};
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
		chrome.tabs.sendMessage(tabs[0].id, { action: "redirectDofusNoobs", mapping });
	});
});