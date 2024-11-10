chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "saveToBrain",
        title: "Add random color to Popup",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Check if the correct menu item was clicked and if text was selected
    if (info.menuItemId === "saveToBrain" && info.selectionText) {

        chrome.storage.local.get({ selectedTextList: [] }, (data) => {

            const updatedList = [...data.selectedTextList, info.selectionText];

            chrome.storage.local.set({ selectedTextList: updatedList });
        });
    }
});