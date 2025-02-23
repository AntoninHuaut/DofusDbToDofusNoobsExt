function isValidHttpUrl(string) {
	let url;

	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}

	return url.protocol === "http:" || url.protocol === "https:";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action !== "redirectDofusNoobs") return;
	if (!message.mapping) return console.error("No mapping provided");

	const pathParts = window.location.pathname.split("/");
	if (pathParts.length < 3) return;

	const type = pathParts[pathParts.length - 2];
	if (type !== "dungeon" && type !== "quest") return;

	const id = pathParts[pathParts.length - 1];
	const dbNoobsUrl = message.mapping[type][id];
	const isValidUrl = isValidHttpUrl(dbNoobsUrl);

	if (!dbNoobsUrl) return console.error("No mapping found for", id);
	if (!isValidUrl) {
		alert(`Cannot redirect, reason: \n\n${dbNoobsUrl}`);
		return;
	}

	window.location.href = dbNoobsUrl;
});
