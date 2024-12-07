let isPaused = false;
let autoplay = true;
let _debug = false;
let playerVisible = true; // In-memory state only

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({isPaused: false}); // Default to not paused
    chrome.storage.sync.set({autoplay: true});
});

// Message handling
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (_debug) { console.log('Received message in background:', request); }
    if (request.message === "toggleState") {
        isPaused = !isPaused;
        chrome.storage.sync.set({isPaused: isPaused}); // Save state
        sendUpdateObserverMessage();
        sendResponse({state: isPaused});
    } else if (request.message === "getState") {
        sendResponse({state: isPaused});
    } else if (request.message === "updateAutoplay") {
        sendUpdateAutoplayMessage(request.autoplay);
        chrome.storage.sync.set({autoplay: request.autoplay});
    } else if (request.message === "togglePlayerVisibility") {
        playerVisible = !playerVisible;
        sendUpdatePlayerVisibilityMessage(playerVisible);
        sendResponse({visible: playerVisible});
    }
});

function sendUpdateObserverMessage() {
    chrome.tabs.query({url: "*://*.youtube.com/*"}, tabs => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {message: "updateObserver", isPaused: isPaused});
            if (_debug) console.log('Message sent to tab:', tab.id);
        });
    });
}

function sendUpdateAutoplayMessage(_autoplay) {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length > 0) {
            const tab = tabs[0];
            const message = {message: "updateAutoplay", autoplay: _autoplay};
            chrome.tabs.sendMessage(tab.id, message);
            if (_debug) console.log('Autoplay message sent to tab:', tab.id);
        }
    });
}

function sendUpdatePlayerVisibilityMessage(isVisible) {
    chrome.tabs.query({url: "*://*.youtube.com/*"}, tabs => {
        tabs.forEach(tab => {
            const message = {message: "toggleEmbed", visible: isVisible};
            chrome.tabs.sendMessage(tab.id, message);
            if (_debug) console.log('Player visibility message sent to tab:', tab.id);
        });
    });
}

chrome.runtime.onStartup.addListener(() => {
    // Restore only paused/autoplay states
    chrome.storage.sync.get(['isPaused', 'autoplay'], (data) => {
        if (data.isPaused !== undefined) {
            isPaused = data.isPaused;
            sendUpdateObserverMessage();
            if (_debug) console.log('State restored:', isPaused);
        }
        if (data.autoplay !== undefined) {
            autoplay = data.autoplay;
            if (_debug) console.log('Autoplay state restored:', autoplay);
        }
    });
});
