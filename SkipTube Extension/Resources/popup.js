let _debug = false;

// On load, fetch and display the current state (paused/resumed)
document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({message: "getState"}, (response) => {
        updateButton(response.state);
        if (_debug) console.log('Initial state:', response.state);
    });
    
    // Fetch and set the initial autoplay state
    chrome.storage.sync.get(['autoplay'], (result) => {
        document.getElementById('autoplay-checkbox').checked = result.autoplay;
        if (_debug) console.log('Initial autoplay state:', result.autoplay);
    });
    
    // Handle button click (toggle pause/resume)
    document.getElementById('pause-resume').addEventListener('click', () => {
        chrome.runtime.sendMessage({message: "toggleState"}, (response) => {
            updateButton(response.state);
            if (_debug) console.log('State toggled to:', response.state);
        });
    });
    
    document.getElementById('autoplay-checkbox').addEventListener('change', () => {
        const _autoplay = document.getElementById("autoplay-checkbox").checked;
        chrome.runtime.sendMessage({message: "updateAutoplay", autoplay: _autoplay});
    });
});


// Utility function to update button text
function updateButton(isPaused) {
    document.getElementById('pause-resume').textContent = isPaused ? "Resume" : "Pause";
}
