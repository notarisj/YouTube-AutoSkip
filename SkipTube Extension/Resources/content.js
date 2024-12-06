let _debug = false;
let _speedup = false;
let _pushAdsToEnd = false;
let _skipTo = 0;
let _isPaused = false;
let _autoplay = false;
let _lastUrl = null;

// Load settings. TODO: (can be optimized with Promise.all)
chrome.storage.sync.get(['isPaused', 'autoplay'], function (result) {
    _isPaused = result.isPaused || false;
    _autoplay = result.autoplay || false;
    
    if (_debug) console.log('Settings loaded:', result);
    
    if (!_isPaused) {
        startObserver();
        warmUp(); // Run initial cleanup
    }
});

function replaceYouTubePlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    
    if (videoId && !_isPaused) {
        const embedCode = `
          <iframe id="custom-embed" src="https://cdpn.io/pen/debug/oNPzxKo?v=${videoId}${_autoplay ? '&autoplay=1' : ''}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen">
            <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">https://www.youtube.com/watch?v=${videoId}</a>
          </iframe>
        `;
        
        const ytdPlayer = document.getElementById('ytd-player');
        if (ytdPlayer) {
            const ytdChild = ytdPlayer.children[0];
            ytdChild.style.display = 'none';
            
            if (ytdPlayer.children.length > 1) {
                const secondChild = ytdPlayer.children[1];
                ytdPlayer.removeChild(secondChild);
            }
            
            const embedDiv = document.createElement('div');
            embedDiv.innerHTML = embedCode;
            ytdPlayer.appendChild(embedDiv);
        }
    } else {
        const embedVid = document.getElementById('movie_player');
        if (embedVid) embedVid.pauseVideo();
    }
}

function pauseDefaultPlayer() {
    if (_isPaused) return;
    var videoElement = document.querySelector('.video-stream.html5-main-video');
    if (videoElement && !videoElement.paused) {
        videoElement.pause();
    }
}

function adjustSize() {
    if (_isPaused) return;
    const player = document.getElementById('player');
    const customEmbed = document.getElementById('custom-embed');
    
    if (player && customEmbed) {
        customEmbed.width = player.offsetWidth;
        customEmbed.height = player.offsetHeight;
    }
}

function checkUrlChange() {
    if (_isPaused) return;
    const currentUrl = window.location.href;
    if (currentUrl !== _lastUrl || _lastUrl === null) {
        _lastUrl = currentUrl;
        replaceYouTubePlayer();
    }
}

setInterval(checkUrlChange, 1000);
setInterval(pauseDefaultPlayer, 1000);
setInterval(adjustSize, 1000);

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
            // Find the specific parent ytd-rich-item-renderer within ytd-rich-grid-renderer
            const richParent = el.closest('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer');
            if (richParent) {
                if (_debug) console.log('Removing parent ytd-rich-item-renderer:', richParent);
                richParent.remove();
                return; // Skip further processing for this element
            }
            
            // Find the parent ytd-reel-video-renderer
            const reelParent = el.closest('ytd-reel-video-renderer');
            if (reelParent) {
                if (_debug) console.log('Removing parent ytd-reel-video-renderer:', reelParent);
                reelParent.style.display = 'none';
                return; // Skip further processing for this element
            }
            
            // If no specific parent found, remove the ad element itself
            if (_debug) console.log('Removing ad:', el);
            el.remove();
        });
    }

    // Special case for top-row home ad
    const topAd = document.querySelector('ytd-ad-slot-renderer');
    if (topAd) {
        const topAdParent = topAd.closest('ytd-reel-video-renderer') || 
                            topAd.closest('ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer');
        if (topAdParent) {
            if (_debug) console.log('Removing top-row ad parent:', topAdParent);
            topAdParent.remove();
        } else {
            if (_debug) console.log('Removing top-row ad directly:', topAd);
            topAd.remove();
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
                if (node.matches('[class*="ad-slot-renderer"], [class*="banner-promo-renderer"]')) removeAds();
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
        window.location.reload();
    } else if (request.message === 'updateAutoplay') {
        _autoplay = request.autoplay;
        replaceYouTubePlayer();
    }
});
