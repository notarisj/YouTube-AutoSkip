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
    
    // Auto click "Don't renew" on promo popups
    removePopup('yt-mealbar-promo-renderer', '#dismiss-button'); // type 1
    removePopup('ytmusic-mealbar-promo-renderer', '.dismiss-button'); // type 2
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

/**
 * @function removePopup
 * @description Removes promo popup by clicking the specified button.
 * @param {string} popupName - CSS selector for the promo popup element.
 * @param {string} preferredButton - CSS selector for the preferred button within the popup.
 */
function removePopup(popupName, preferredButton) {
    var popupPromoRenderer = document.querySelector(popupName);
    if (popupPromoRenderer) {
        var dontRenewButton = mealbarPromoRenderer.querySelector(preferredButton);
        if (dontRenewButton) dontRenewButton.click();
    }
}

// Function to filter only the add elements from all the mutations
function handleMutations(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(addedNode => {
                if (addedNode.nodeType === 1) { // Check if it's an element node
                    const adClasses = [
                        'ytp-ad-skip-button',
                        'ytp-ad-skip-button-modern',
                        'ytp-ad-player-overlay',
                        'ytd-ad-slot-renderer',
                        'ytd-banner-promo-renderer',
                        'ytd-player-legacy-desktop-watch-ads-renderer',
                        'ytd-action-companion-ad-renderer',
                        'yt-mealbar-promo-renderer',
                        'ytmusic-mealbar-promo-renderer'
                    ];

                    if (adClasses.some(adClass => addedNode.classList.contains(adClass))) {
                        removeAds();
                    }
                }
            });
        }
    }
}


const config = { childList: true, subtree: true };
let observer = new MutationObserver(handleMutations);
observer.observe(document.body, config);
removeAds();

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
