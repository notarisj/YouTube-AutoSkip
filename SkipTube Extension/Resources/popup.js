let _debug = false;

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({
        message: "getState"
    }, function (response) {
        updateButtonLabel(response.state);
        if (_debug) {
            console.log('DOMContentLoaded: State updated to ', response.state);
        }
    });
});

// Event listener for pause-resume click
document.getElementById('pause-resume').addEventListener('click', function () {
    chrome.runtime.sendMessage({
        message: "toggleState"
    }, function (response) {
        chrome.storage.sync.set({ state: response.state });
        updateButtonLabel(response.state);
        if (_debug) {
            console.log('Pause button clicked: State toggled to ', response.state);
        }
    });
});

/**
 * @function updateButtonLabel
 * @description Updates the button label based on the extension state.
 * @param {boolean} isPaused - The current state of the extension.
 */
function updateButtonLabel(isPaused) {
    if (isPaused) {
        document.getElementById('pause-resume').textContent = "Resume";
    } else {
        document.getElementById('pause-resume').textContent = "Pause";
    }
    if (_debug) {
        console.log('Button label updated: ', isPaused ? 'Resume' : 'Pause');
    }
}

// Event listener for option1 and option2
document.getElementById('option1').addEventListener('change', function () {
    var isChecked = this.checked; // Store checkbox value
    document.getElementById('option1').checked = isChecked;
    chrome.storage.sync.set({ option1: isChecked });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: 'option1', value: isChecked }); // Use stored value
    });
    if (_debug) {
        console.log('Option1 changed: ', isChecked);
    }
});

document.getElementById('option2').addEventListener('change', function () {
    var isChecked = this.checked; // Store the checkbox value
    document.getElementById('option2').checked = isChecked;
    chrome.storage.sync.set({ option2: isChecked });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: 'option2', value: isChecked }); // Use stored value
    });
    if (_debug) {
        console.log('Option2 changed: ', isChecked);
    }
});

// Event listener for slider
document.getElementById('slider').addEventListener('input', function () {
    var sliderValue = this.value;
    document.getElementById('slider-value').textContent = sliderValue + '%';
    chrome.storage.sync.set({ slider: sliderValue });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: 'slider', value: sliderValue });
    });
    if (_debug) {
        console.log('Slider value changed: ', sliderValue);
    }
});

// Restore options
chrome.storage.sync.get(['option1', 'option2'], function (result) {
    document.getElementById('option1').checked = result.option1 || false;
    document.getElementById('option2').checked = result.option2 || false;
    if (_debug) {
        console.log('Options restored from storage: ', result);
    }
});

chrome.storage.sync.get('slider', function (result) {
    document.getElementById('slider').value = result.slider || 90;
    document.getElementById('slider-value').textContent = (result.slider || 90) + '%';
    if (_debug) {
        console.log('Slider value restored from storage: ', result.slider);
    }
});

// Message listener for updating UI
chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    if (request.message === "updateUI") {
        updateButtonLabel(request.isPaused);
        if (_debug) {
            console.log('UI updated: ', request.isPaused ? 'Resume' : 'Pause');
        }
    }
});
