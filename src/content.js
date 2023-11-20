/**
 * @function removeAds
 * @description Controls the removal of ads on the YouTube page based on the extension state.
 * @fires chrome.runtime.sendMessage
 */
function removeAds() {
    var skipButton = document.querySelector('.ytp-ad-skip-button');
    var skipButtonModern = document.querySelector('.ytp-ad-skip-button-modern');
    var adOverlay = document.querySelector('.ytp-ad-player-overlay');

    if (skipButton) {
        skipButton.click();
    } else if (skipButtonModern) {
        skipButtonModern.click();
    } else if (adOverlay) {
        let videoPlayer = document.querySelector('video');
        if (videoPlayer) {
            videoPlayer.muted = true;
            videoPlayer.playbackRate = 10;
        }
    }

    // Remove ad from the top row of Home. This is handled differently from the others because
    // ytd-rich-item-renderer is used for all videos. It has to match ytd-ad-slot-renderer and
    // then find the closest ancestor.
    var adElement = document.querySelector('ytd-ad-slot-renderer');
    if (adElement) {
        var toBeRemoved = adElement.closest('ytd-rich-item-renderer');
        if (toBeRemoved) {
            toBeRemoved.remove();
        }
    }

    removeElement('ytd-banner-promo-renderer'); // Remove top banner
    removeElement('ytd-player-legacy-desktop-watch-ads-renderer'); // Remove top banner while playing video 1
    removeElement('ytd-action-companion-ad-renderer'); // Remove top banner while playing video 2
    removeElement('ytd-ad-slot-renderer'); // Remove ads between videos

}

/**
 * @function removeElement
 * @description Removes the specified HTML element from the document.
 * @param {string} selector - CSS selector for the element to be removed.
 */
function removeElement(selector) {
    var adElement = document.querySelector(selector);
    if (adElement) {
        adElement.remove();
    }
}

// Function to filter only the add elements from all the mutations
function handleMutations(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.nodeType === 1) { // Check if it's an element node
                    if (addedNode.classList.contains('ytp-ad-skip-button') ||
                        addedNode.classList.contains('ytp-ad-skip-button-modern') ||
                        addedNode.classList.contains('ytp-ad-player-overlay') ||
                        addedNode.classList.contains('ytd-ad-slot-renderer') ||
                        addedNode.classList.contains('ytd-banner-promo-renderer') ||
                        addedNode.classList.contains('ytd-player-legacy-desktop-watch-ads-renderer') ||
                        addedNode.classList.contains('ytd-action-companion-ad-renderer')) {
                        removeAds();
                    }
                }
            }
        }
    }
}

const config = { childList: true, subtree: true };
let observer = new MutationObserver(handleMutations);
observer.observe(document.body, config);

chrome.runtime.onMessage.addListener(function(request) {
    if (request.message === 'updateObserver') {
        if (request.isPaused) {
            observer.disconnect();
        } else {
            observer.observe(document.body, config);
        }
    }
});

//chrome.runtime.sendMessage({
//    message: "getState"
//}, function(response) {
//    if (!response.state) {
//        // Disconnect observer if extension is initially paused
//        observer.disconnect();
//    }
//});
