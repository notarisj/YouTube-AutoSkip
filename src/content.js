
// let adOverlay = document.querySelector('.ytp-ad-player-overlay');
// let adDurationElement = document.querySelector('.ytp-ad-duration-remaining');

// let durationText = adDurationElement.innerText;
// let durationParts = durationText.split(':').map(part => parseInt(part, 10));
// let adDurationInSeconds = durationParts.reduce((total, part) => (total * 60) + part, 0);

function checkAndSkipAds() {
  chrome.runtime.sendMessage({message: "getState"}, function(response) {
    if (!response.state) {
      let skipButton = document.querySelector('.ytp-ad-skip-button');
      let skipButtonModern = document.querySelector('.ytp-ad-skip-button-modern');
      let adOverlay = document.querySelector('.ytp-ad-player-overlay');

      if (skipButton) {
        skipButton.click();
      } else if (skipButtonModern) {
        skipButtonModern.click();
      } else if (adOverlay) {
        let videoPlayer = document.querySelector('video');
        if (videoPlayer) {
          videoPlayer.muted = true; // Mute the audio
          videoPlayer.playbackRate = 10; // Speed up playback to quickly pass through unskippable ad
        }
      }
    }
  });
}

setInterval(checkAndSkipAds, 1000);