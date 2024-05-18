let _debug = false;

// On load, fetch and display the current state (paused/resumed)
document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({message: "getState"}, (response) => {
        updateButton(response.state);
        if (_debug) console.log('Initial state:', response.state);
    });
    
    // Load options
    chrome.storage.sync.get(['option1', 'option2', 'slider'], (result) => {
        Object.entries(result).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === "checkbox") {
                    element.checked = value;
                } else {
                    element.value = value;
                    // Update slider value text (if applicable)
                    if (key === "slider") {
                        document.getElementById('slider-value').textContent = value + '%';
                    }
                }
            }
        });
    });
});

// Handle button click (toggle pause/resume)
document.getElementById('pause-resume').addEventListener('click', () => {
    chrome.runtime.sendMessage({message: "toggleState"}, (response) => {
        updateButton(response.state);
        if (_debug) console.log('State toggled to:', response.state);
    });
});

// Option change handlers (update storage and send message to content script)
['option1', 'option2'].forEach(option => {
    document.getElementById(option).addEventListener('change', function() {
        chrome.storage.sync.set({[option]: this.checked});
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {command: option, value: this.checked});
        });
    });
});

document.getElementById('slider').addEventListener('input', function() {
    const value = this.value;
    document.getElementById('slider-value').textContent = value + '%';
    chrome.storage.sync.set({slider: value});
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {command: 'slider', value: value});
    });
});

document.getElementById('slider').addEventListener('input', function() {
    const value = this.value;
    document.getElementById('slider-value').textContent = value + '%';

    const warningMessage = document.getElementById('slider-warning');

    if (value > 90) {
        warningMessage.style.display = 'block';
    } else {
        warningMessage.style.display = 'none';
    }

    chrome.storage.sync.set({slider: value});
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {command: 'slider', value: value});
    });
});

// Utility function to update button text
function updateButton(isPaused) {
    document.getElementById('pause-resume').textContent = isPaused ? "Resume" : "Pause";
}
