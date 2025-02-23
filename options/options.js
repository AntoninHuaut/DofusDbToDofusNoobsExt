document.addEventListener("DOMContentLoaded", () => {
    const autoRedirectDungeons = document.getElementById("autoRedirectDungeons");
    const autoRedirectQuests = document.getElementById("autoRedirectQuests");
    const saveButton = document.getElementById("save");

    chrome.storage.local.get(["autoRedirectDungeons", "autoRedirectQuests"], (data) => {
        autoRedirectDungeons.checked = data?.autoRedirectDungeons ?? false;
        autoRedirectQuests.checked = data?.autoRedirectQuests ?? false;
    });

    saveButton.addEventListener("click", () => {
        chrome.storage.local.set({ autoRedirectDungeons: autoRedirectDungeons.checked, autoRedirectQuests: autoRedirectQuests.checked }, () => {
            alert("Saved");
        });
    });
});
