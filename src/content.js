function checkAndSkipAds() {
  chrome.runtime.sendMessage({message: "getState"}, function(response) {
    if (!response.state) {
      let videoPlayer = document.querySelector('video');
      let adDurationElement = document.querySelector('.ytp-ad-duration-remaining');

      if (videoPlayer && adDurationElement) {
        // Extract remaining ad duration
        let durationText = adDurationElement.innerText;
        let durationParts = durationText.split(':').map(part => parseInt(part, 10));
        let adDurationInSeconds = durationParts.reduce((total, part) => (total * 60) + part, 0);

        // Seek to the end of the ad
        videoPlayer.currentTime += adDurationInSeconds + 1;

        let skipButton = document.querySelector('.ytp-ad-skip-button');
        let skipButtonModern = document.querySelector('.ytp-ad-skip-button-modern');

        // Click the skip button if shown at the end
        if (skipButton) {
          skipButton.click();
        } else if (skipButtonModern) {
          skipButtonModern.click();
        }

      }
    }
  });
}

setInterval(checkAndSkipAds, 1000);
