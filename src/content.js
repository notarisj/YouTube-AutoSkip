function removeAds() {
    chrome.runtime.sendMessage({
        message: "getState"
    }, function(response) {
        if (!response.state) {
            // Skip ads within a video
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

            var adElement = document.querySelector('ytd-ad-slot-renderer');
            if (adElement) {
                // Remove ad from top row of Home
                var toBeRemoved = adElement.closest('ytd-rich-item-renderer');
                if (toBeRemoved) {
                    toBeRemoved.remove();
                }
            }

            adElement = document.querySelector('ytd-banner-promo-renderer');
            if (adElement) {
                // Remove top banner
                adElement.remove();
            }

            adElement = document.querySelector('ytd-player-legacy-desktop-watch-ads-renderer');
            if (adElement) {
                // Remove top banner while playing video 1
                adElement.remove();
            }

            adElement = document.querySelector('ytd-action-companion-ad-renderer');
            if (adElement) {
                // Remove top banner while playing video 2
                adElement.remove();
            }

            adElement = document.querySelector('ytd-ad-slot-renderer');
            if (adElement) {
                // Remove ads between videos
                adElement.remove();
            }
        }
    });
}

setInterval(removeAds, 1000);
