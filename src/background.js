let isPaused = false;

// Function to send a message to content.js to update the observer state
function sendUpdateObserverMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            message: "updateObserver",
            isPaused: isPaused,
        });
    });
}

// Extension installation event
chrome.runtime.onInstalled.addListener(() => {
    console.log('YouTube Ad Skipper extension installed.');
});

// Message listener for handling state toggling and getting current state
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
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
