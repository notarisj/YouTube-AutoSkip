let _debug = false;
let _speedup;
let _pushAdsToEnd;
let _skipTo;

chrome.storage.sync.get(['option1', 'option2'], function (result) {
    setSpeedup(result.option1);
    setPushAdsToEnd(result.option2);
    if (_debug) {
        console.log('Options retrieved from storage: ', result);
    }
});

chrome.storage.sync.get('slider', function (result) {
    setSkipTo(result.slider);
    if (_debug) {
        console.log('Slider value retrieved from storage: ', result.slider);
    }
});

function setSpeedup(value) {
    _speedup = value;
    if (_debug) {
        console.log('Speedup set to: ', _speedup);
    }
}

function getSpeedup() {
    return _speedup;
}

function setPushAdsToEnd(value) {
    _pushAdsToEnd = value;
    if (_debug) {
        console.log('PushAdsToEnd set to: ', _pushAdsToEnd);
    }
}

function getPushAdsToEnd() {
    return _pushAdsToEnd;
}

function setSkipTo(value) {
    _skipTo = value;
    if (_debug) {
        console.log('SkipTo set to: ', _skipTo);
    }
}

function getSkipTo() {
    return _skipTo;
}


function clickSkipButton() {
    var skipButton = document.querySelector('.ytp-ad-skip-button');
    var skipButtonModern = document.querySelector('.ytp-ad-skip-button-modern');

    if (skipButton) {
        skipButton.click();
        if (_debug) {
            console.log('Skip button clicked.');
        }
    } else if (skipButtonModern) {
        skipButtonModern.click();
        if (_debug) {
            console.log('Modern skip button clicked.');
        }
    }
}

function skipUnskippableAd() {
    var adOverlay = document.querySelector('.ytp-ad-player-overlay');
    let videoPlayer = document.querySelector('video');

    if (videoPlayer && adOverlay) {
        videoPlayer.muted = true;
        if (getSpeedup()) {
            videoPlayer.playbackRate = 16;
            if (_debug) {
                console.log('Speedup applied.');
            }
        }
        if (getPushAdsToEnd()) {
            videoPlayer.currentTime = videoPlayer.duration * (getSkipTo() / 100);
            if (_debug) {
                console.log('PushAdsToEnd applied. New video time: ', videoPlayer.currentTime);
            }
        }
    }
}


function removeBannerAds() {
    // Remove ad from the top row of Home. This is handled differently from the others because
    // ytd-rich-item-renderer is used for all videos. It has to match ytd-ad-slot-renderer and
    // then find the closest ancestor.
    var adElement = document.querySelector('ytd-ad-slot-renderer');
    if (adElement) {
        var toBeRemoved = adElement.closest('ytd-rich-item-renderer');
        if (toBeRemoved) {
            toBeRemoved.remove();
            if (_debug) {
                console.log('Banner ad removed.');
            }
        }
    }

    removeElement('ytd-banner-promo-renderer'); // Remove top banner
    removeElement('ytd-player-legacy-desktop-watch-ads-renderer'); // Remove top banner while playing video 1
    removeElement('ytd-action-companion-ad-renderer'); // Remove top banner while playing video 2
    removeElement('ytd-ad-slot-renderer'); // Remove ads between videos
}

/**
 * @function removePromoPopups
 * @description Auto click "Don't renew" on promo popups.
 */
function removePromoPopups() {
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
        if (_debug) {
            console.log('Element removed: ', selector);
        }
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
        if (dontRenewButton) {
            dontRenewButton.click();
            if (_debug) {
                console.log('Popup removed: ', popupName);
            }
        }
    }
}

function warmUp() {
    clickSkipButton();
    skipUnskippableAd();
    removeBannerAds();
    removePromoPopups();
}

const handleAdSkip = (addedNode) => {
    if (addedNode.classList.contains('ytp-ad-skip-button') ||
        addedNode.classList.contains('ytp-ad-skip-button-modern') ||
        addedNode.classList.contains('ytp-ad-player-overlay')) {
        clickSkipButton();
        skipUnskippableAd();
    }
};

const handleBannerAds = (addedNode) => {
    if (addedNode.classList.contains('ytd-ad-slot-renderer') ||
        addedNode.classList.contains('ytd-banner-promo-renderer') ||
        addedNode.classList.contains('ytd-player-legacy-desktop-watch-ads-renderer') ||
        addedNode.classList.contains('ytd-action-companion-ad-renderer')) {
        removeBannerAds();
    }
};

const handlePromoPopups = (addedNode) => {
    if (addedNode.classList.contains('yt-mealbar-promo-renderer') ||
        addedNode.classList.contains('ytmusic-mealbar-promo-renderer')) {
        removePromoPopups();
    }
};

/**
 * @function handleMutations
 * @description Handles mutations in the DOM and triggers specific function based on the added nodes.
 * @param {MutationRecord[]} mutationsList - List of mutation records describing the changes to the DOM.
 * @param {MutationObserver} observer - The MutationObserver instance.
 */
function handleMutations(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(addedNode => {
                if (addedNode.nodeType === 1) { // Check if it's an element node
                    handleAdSkip(addedNode);
                    handleBannerAds(addedNode);
                    handlePromoPopups(addedNode);
                }
            });
        }
    }
}

const config = { childList: true, subtree: true };
let observer = new MutationObserver(handleMutations);
observer.observe(document.body, config);
removeBannerAds();
removePromoPopups();

chrome.runtime.onMessage.addListener(function (request) {
    if (request.message === 'updateObserver') {
        if (request.isPaused) {
            observer.disconnect();
            if (_debug) {
                console.log('Observer disconnected.');
            }
        } else {
            observer.observe(document.body, config);
            warmUp();
            if (_debug) {
                console.log('Observer reconnected.');
            }
        }
    }
});

// Options listeners
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'option1') {
        setSpeedup(request.value);
    } else if (request.command === 'option2') {
        setPushAdsToEnd(request.value);
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'slider') {
        setSkipTo(request.value);
    }
});
