let isPaused = false;
let _debug = false;

// Function to send a message to content.js to update the observer state
function sendUpdateObserverMessage() {
    // Send message to content.js to update observer
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            message: "updateObserver",
            isPaused: isPaused,
        });
    });

    // Update UI in popup.js
    if (chrome.extension.getViews({ type: "popup" }).length > 0) {
        // If popup is open, send message to it
        chrome.runtime.sendMessage({
            message: "updateUI",
            isPaused: isPaused,
        });
    }
}

// Extension installation event
chrome.runtime.onInstalled.addListener(() => {
    console.log('YouTube Ad Skipper extension installed.');
});

// Message listener for handling state toggling and getting current state
chrome.runtime.onMessage.addListener(
    function (request, _, sendResponse) {
        if (request.message === "toggleState") {
            isPaused = !isPaused;
            sendResponse({
                state: isPaused
            });
            sendUpdateObserverMessage(); // Send message to update observer state
        }
        if (request.message === "getState") {
            sendResponse({
                state: isPaused
            });
        }
    }
);

// restore state
chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get('state', function (data) {
        if (data.state !== undefined) {
            isPaused = data.state;
            sendUpdateObserverMessage();
            if (_debug) {
                console.log('State restored from storage: ', isPaused);
            }
        }
    });
});
