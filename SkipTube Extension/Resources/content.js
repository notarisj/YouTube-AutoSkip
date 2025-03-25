let _debug = false;
let _speedup = false;
let _pushAdsToEnd = false;
let _skipTo = 0;
let _isPaused = false;
let _autoplay = false;
let _lastUrl = null;
let _playerVisible = true; // Default true since we don't store it
let pauseInterval = false;

// Load settings. TODO: (can be optimized with Promise.all)
chrome.storage.sync.get(['isPaused', 'autoplay'], function (result) {
    _isPaused = result.isPaused || false;
    _autoplay = result.autoplay || false;
    
    if (_debug) console.log('Settings loaded:', result);
    
    if (!_isPaused) {
        startObserver();
        warmUp(); // Run initial cleanup
    }
    updateEmbedVisibility();
    updatePauseInterval();
    setInterval(checkUrlChange, 1000);
    setInterval(adjustSize, 1000);
    resetDefaultVideoTime();
});

function updateEmbedVisibility() {
    const customEmbed = document.getElementById('custom-embed');
    const ytdPlayer = document.getElementById('ytd-player');
    if (customEmbed && ytdPlayer) {
        customEmbed.style.display = _playerVisible ? 'block' : 'none';
        ytdPlayer.children[0].style.display = _playerVisible ? 'none' : 'block';
    }
}

function replaceYouTubePlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    
    if (videoId && !_isPaused) {
        const embedCode = `
          <iframe id="custom-embed" src="https://cdpn.io/pen/debug/oNPzxKo?v=${videoId}&autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen">
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
    if (_isPaused || _autoplay) return;
    var videoElement = document.querySelector('.video-stream.html5-main-video');
    if (videoElement && !videoElement.paused) {
        videoElement.pause();
    }
}

function resetDefaultVideoTime() {
    try {
        var videoElement = document.querySelector('.video-stream.html5-main-video');
        if (videoElement) {
            videoElement.currentTime = 0;
            videoElement.play();
        } else {
            // If video element not found, retry in 1 second
            setTimeout(resetDefaultVideoTime, 1000);
        }
    } catch (error) {
        if (_debug) console.log('Error in resetDefaultVideoTime:', error);
        // Retry in 1 second if any error occurs
        setTimeout(resetDefaultVideoTime, 1000);
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

function updatePauseInterval() {
    if (_autoplay) {
        // If autoplay is enabled, make sure no pause interval exists
        if (pauseInterval) {
            clearInterval(pauseInterval);
            pauseInterval = null;
        }
    } else {
        // If autoplay is disabled, start pausing the default player
        if (!pauseInterval) {
            pauseInterval = setInterval(pauseDefaultPlayer, 1000);
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

    // REMOVE THE ENGAGEMENT PANEL ADS SECTION
    const adsEngagementPanel = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]');
    if (adsEngagementPanel) {
        if (_debug) console.log('Removing ytd-engagement-panel-section-list-renderer with target-id="engagement-panel-ads":', adsEngagementPanel);
        adsEngagementPanel.remove();
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
        updatePauseInterval();
    } else if (request.message === 'toggleEmbed') {
        _playerVisible = request.visible;
        updateEmbedVisibility();
    }
});

// Shortcut key listener
document.addEventListener('keydown', function (event) {
    // Shortcut: Ctrl + B
    if (event.ctrlKey && event.code === 'KeyB') {
        _playerVisible = !_playerVisible; // Toggle visibility
        updateEmbedVisibility(); // Apply the change
        if (_debug) console.log(`Player visibility toggled: ${_playerVisible}`);
    }
});

function addNextButtonNextToTitle() {
    // Find the title element
    const titleElement = document.querySelector("#title h1.style-scope.ytd-watch-metadata");
    
    if (!titleElement) {
        if (_debug) console.log("Title element not found!");
        return;
    }

    // Check if the button already exists
    const existingButton = document.querySelector("#custom-next-button");
    if (existingButton) {
        if (_debug) console.log("Next button already exists!");
        return;
    }

    // Create the new button
    const nextButton = document.createElement('button');
    nextButton.id = "custom-next-button"; // Add an ID to identify it easily
    nextButton.textContent = "Next";
    nextButton.style.marginLeft = "10px"; // Space between title and button
    nextButton.style.cursor = "pointer";
    nextButton.style.padding = "5px 10px";
    nextButton.style.border = "none";
    nextButton.style.backgroundColor = "#cc0000";
    nextButton.style.color = "#fff";
    nextButton.style.borderRadius = "4px";
    nextButton.style.fontSize = "14px";
    nextButton.style.alignSelf = "center"; // Ensure proper alignment with the title

    // Add click event to invoke the next video action
    const originalNextButton = document.querySelector('.ytp-next-button.ytp-button');
    if (originalNextButton) {
        nextButton.addEventListener('click', () => {
            originalNextButton.click();
        });
    } else {
        if (_debug) console.log("Original 'Next' button not found!");
    }

    // Insert the button next to the title
    const parentContainer = titleElement.parentNode;
    if (parentContainer) {
        parentContainer.style.display = "flex"; // Ensure parent container uses flexbox for alignment
        parentContainer.style.alignItems = "center"; // Align items vertically
        parentContainer.insertBefore(nextButton, titleElement.nextSibling); // Add button directly after title
    } else {
        if (_debug) console.log("Title's parent container not found!");
    }
}

function addHidePlayerButton() {
    const titleElement = document.querySelector("#title h1.style-scope.ytd-watch-metadata");

    if (!titleElement) {
        if (_debug) console.log("Title element not found!");
        return;
    }

    // Check if the button already exists
    const existingButton = document.querySelector("#custom-hide-player-button");
    if (existingButton) {
        if (_debug) console.log("Hide Player button already exists!");
        return;
    }

    // Create the button
    const hidePlayerButton = document.createElement('button');
    hidePlayerButton.id = "custom-hide-player-button";
    hidePlayerButton.textContent = _playerVisible ? "Hide Player" : "Show Player";
    hidePlayerButton.style.marginLeft = "10px";
    hidePlayerButton.style.cursor = "pointer";
    hidePlayerButton.style.padding = "5px 10px";
    hidePlayerButton.style.border = "none";
    hidePlayerButton.style.backgroundColor = "#555";
    hidePlayerButton.style.color = "#fff";
    hidePlayerButton.style.borderRadius = "4px";
    hidePlayerButton.style.fontSize = "14px";
    hidePlayerButton.style.alignSelf = "center";

    hidePlayerButton.addEventListener("click", () => {
        _playerVisible = !_playerVisible;
        updateEmbedVisibility();
        hidePlayerButton.textContent = _playerVisible ? "Hide Player" : "Show Player";
        if (_debug) console.log("Player visibility toggled:", _playerVisible);
    });

    // Insert the button next to the "Next" button
    const nextButton = document.querySelector("#custom-next-button");
    if (nextButton) {
        nextButton.insertAdjacentElement("afterend", hidePlayerButton);
    } else {
        titleElement.parentNode.appendChild(hidePlayerButton);
    }
}

// Update interval to add both buttons
const intervalId = setInterval(() => {
    addNextButtonNextToTitle();
    addHidePlayerButton();

    if (document.querySelector("#custom-next-button") && document.querySelector("#custom-hide-player-button")) {
        clearInterval(intervalId);
    }
}, 1000);
