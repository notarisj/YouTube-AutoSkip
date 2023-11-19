/**
 * @function removeAds
 * @description Controls the removal of ads on the YouTube page based on the extension state.
 * @fires chrome.runtime.sendMessage
 */
function removeAds() {
    chrome.runtime.sendMessage({
        message: "getState"
    }, function(response) {
        if (!response.state) {
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
    });
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

setInterval(removeAds, 1000);
