let isPaused = false;
let _debug = false;

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({isPaused: false}); // Default to not paused
});

// Message handling
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (_debug) { console.log('Received message in background:', request); }
    if (request.message === "toggleState") {
        isPaused = !isPaused;
        chrome.storage.sync.set({isPaused: isPaused}); // Save state
        sendUpdateMessage();
        sendResponse({state: isPaused});
    } else if (request.message === "getState") {
        sendResponse({state: isPaused});
    }
});

// Send state updates to all relevant tabs
function sendUpdateMessage() {
    chrome.tabs.query({url: "*://*.youtube.com/*"}, tabs => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {message: "updateObserver", isPaused: isPaused});
            if (_debug) {
                console.log('Message sent to content script in tab:', tab.id);
            }
        });
    });
}

chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get('state', function (data) {
        if (data.state !== undefined) {
            isPaused = data.state;
            sendUpdateMessage();
            if (_debug) {
                console.log('State restored from storage: ', isPaused);
            }
        }
    });
});
