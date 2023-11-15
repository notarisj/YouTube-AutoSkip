let isPaused = false;

chrome.runtime.onInstalled.addListener(() => {
    console.log('YouTube Ad Skipper extension installed.');
});

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
