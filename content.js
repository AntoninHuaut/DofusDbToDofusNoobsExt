chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action !== "redirectDofusNoobs") return;
	if (!message.mapping) return console.error("No mapping provided");

	const pathParts = window.location.pathname.split("/");
	const id = pathParts[pathParts.length - 1];
	const dbNoobsLocation = message.mapping[id];
	if (dbNoobsLocation) {
		window.location.href = dbNoobsLocation;
	} else {
		console.error("No mapping found for", id);
	}
});
