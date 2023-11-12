document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({message: "getState"}, function(response) {
    updateButtonLabel(response.state);
  });
});

document.getElementById('toggleButton').addEventListener('click', function() {
  chrome.runtime.sendMessage({message: "toggleState"}, function(response) {
    updateButtonLabel(response.state);
  });
});

function updateButtonLabel(isPaused) {
  if (isPaused) {
    document.getElementById('toggleButton').textContent = "Resume";
  } else {
    document.getElementById('toggleButton').textContent = "Pause";
  }
}