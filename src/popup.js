// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({
        message: "getState"
    }, function(response) {
        updateButtonLabel(response.state);
    });
});

// Event listener for pauseButton click
document.getElementById('pauseButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({
        message: "toggleState"
    }, function(response) {
        updateButtonLabel(response.state);
    });
});


/**
 * @function updateButtonLabel
 * @description Updates the button label based on the extension state.
 * @param {boolean} isPaused - The current state of the extension.
 */
function updateButtonLabel(isPaused) {
    if (isPaused) {
        document.getElementById('pauseButton').textContent = "Resume";
    } else {
        document.getElementById('pauseButton').textContent = "Pause";
    }
}
