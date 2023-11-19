let isPaused = false;

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
        }
        if (request.message === "getState") {
            sendResponse({
                state: isPaused
            });
        }
    }
);
