document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({message: "getState"}, function(response) {
    updateButtonLabel(response.state);
  });
});

document.getElementById('pauseButton').addEventListener('click', function() {
  chrome.runtime.sendMessage({message: "toggleState"}, function(response) {
    updateButtonLabel(response.state);
  });
});

function updateButtonLabel(isPaused) {
  if (isPaused) {
    document.getElementById('pauseButton').textContent = "Resume";
  } else {
    document.getElementById('pauseButton').textContent = "Pause";
  }
}