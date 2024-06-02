let _debug = false;
let _speedup = false;
let _pushAdsToEnd = false;
let _skipTo = 0;
let _isPaused = false;

// Load settings. TODO: (can be optimized with Promise.all)
chrome.storage.sync.get(['option1', 'option2', 'slider', 'isPaused'], function (result) {
    _speedup = result.option1 || false;
    _pushAdsToEnd = result.option2 || false;
    _skipTo = result.slider || 0;
    _isPaused = result.isPaused || false;
    
    if (_debug) console.log('Settings loaded:', result);
    
    if (!_isPaused) {
        startObserver();
        warmUp(); // Run initial cleanup
    }
});

// Core Functions
function skipAd() {
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
    if (skipButton) {
        if (_debug) console.log('Skippable ad detected. Clicking skip button...');
        skipButton.click();
    }
    else {
        if (_debug) console.log('Unskippable ad detected. Trying to skip...');
        skipUnskippableAd(); // Handle unskippable ads
    }
}

function skipUnskippableAd() {
    const videoPlayer = document.querySelector('video');
    const adOverlay = document.querySelector('[class^="ytp-ad-player-overlay"]');
    if (videoPlayer && adOverlay) {
        videoPlayer.muted = true;
        if (_speedup) {
            videoPlayer.playbackRate = 16;
            if (_debug) console.log('Speedup applied to unskippable ad.');
        }
        if (_pushAdsToEnd) {
            videoPlayer.currentTime = videoPlayer.duration * (_skipTo / 100);
            if (_debug) console.log('Pushing unskippable ad to', _skipTo, '%');
        }
    }
}

function removeAds() {
    const adSelectors = [
        'ytd-ad-slot-renderer',
        'ytd-banner-promo-renderer',
        'ytd-player-legacy-desktop-watch-ads-renderer',
        'ytd-action-companion-ad-renderer'
    ];
    for (const selector of adSelectors) {
        const adElements = document.querySelectorAll(selector);
        if (_debug) console.log('Found', adElements.length, 'ads matching', selector);
        adElements.forEach(el => {
            if (_debug) console.log('Removing ad:', el);
            el.remove();
        });
    }
    
    // Special case for top-row home ad
    const topAd = document.querySelector('ytd-ad-slot-renderer');
    if (topAd) {
        const topAdParent = topAd.closest('ytd-rich-item-renderer');
        if (topAdParent) {
            if (_debug) console.log('Removing top-row ad:', topAdParent);
            topAdParent.remove();
        }
    }
}

function removePromoPopups() {
    // Combined logic for both popup types
    const popups = document.querySelectorAll('.yt-mealbar-promo-renderer, .ytmusic-mealbar-promo-renderer');
    if (_debug) console.log('Found', popups.length, 'promo popups');
    popups.forEach(popup => {
        const dismissButton = popup.querySelector('#dismiss-button, .dismiss-button');
        if (dismissButton) {
            if (_debug) console.log('Removing popup:', popup);
            dismissButton.click();
        } else {
            if (_debug) console.log('No dismiss button found in popup:', popup);
        }
    });
}

function warmUp() {
    if (_debug) console.log('Running warm-up functions...');
    skipAd();
    removeAds();
    removePromoPopups();
}

// Mutation Observer Logic (Targeted)
function handleMutations(mutationsList, observer) {
    if (_isPaused) {
        if (_debug) console.log('Observer is paused. Not handling mutations.');
        return;
    }
    
    for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Ensure it's an element
                if (node.matches('[class^="ytp-ad-player-overlay"]')) skipAd();
                else if (node.matches('[class*="ad-slot-renderer"], [class*="banner-promo-renderer"]')) removeAds();
                else if (node.matches('.yt-mealbar-promo-renderer, .ytmusic-mealbar-promo-renderer')) removePromoPopups();
            }
        }
    }
}


// Observer Setup and Message Handling
function startObserver() {
    if (_debug) console.log('Starting MutationObserver...');
    const observer = new MutationObserver(handleMutations);
    observer.observe(document.body, { childList: true, subtree: true });
}

chrome.runtime.onMessage.addListener(function (request) {
    if (_debug) console.log('Received message:', request);
    
    if (request.message === 'updateObserver') {
        _isPaused = request.isPaused;
        _isPaused ? observer.disconnect() : startObserver(); // Toggle observer
    } else if (request.command.startsWith('option')) {
        // Handle option updates (speedup, pushAdsToEnd, skipTo)
        const optionName = request.command.replace('option', '');
        window['_' + optionName] = request.value;
    }
});
