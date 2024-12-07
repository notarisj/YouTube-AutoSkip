let _debug = false;

document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({message: "getState"}, (response) => {
        updateButton(response.state);
        if (_debug) console.log('Initial pause state:', response.state);
    });
    
    chrome.storage.sync.get(['autoplay'], (result) => {
        document.getElementById('autoplay-checkbox').checked = result.autoplay;
        if (_debug) console.log('Initial autoplay state:', result.autoplay);
    });
    
    // Pause/Resume button
    document.getElementById('pause-resume').addEventListener('click', () => {
        chrome.runtime.sendMessage({message: "toggleState"}, (response) => {
            updateButton(response.state);
            if (_debug) console.log('State toggled to:', response.state);
        });
    });
    
    // Autoplay checkbox
    document.getElementById('autoplay-checkbox').addEventListener('change', () => {
        const _autoplay = document.getElementById("autoplay-checkbox").checked;
        chrome.runtime.sendMessage({message: "updateAutoplay", autoplay: _autoplay});
    });
    
    // Toggle player visibility button
    document.getElementById('toggle-embed-player').addEventListener('click', () => {
        chrome.runtime.sendMessage({message: "togglePlayerVisibility"}, (response) => {
            // Update button text based on the new state
            document.getElementById('toggle-embed-player').textContent = response.visible ? "Hide Player" : "Show Player";
            if (_debug) console.log('Player visibility toggled:', response.visible);
        });
    });
});

function updateButton(isPaused) {
    document.getElementById('pause-resume').textContent = isPaused ? "Resume" : "Pause";
}
