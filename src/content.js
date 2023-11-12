function checkAndSkipAds() {
  chrome.runtime.sendMessage({message: "getState"}, function(response) {
    if (!response.state) {
      let skipButton = document.querySelector('.ytp-ad-skip-button');
      let skipButtonModern = document.querySelector('.ytp-ad-skip-button-modern');

      if (skipButton) {
        skipButton.click();
      } else if (skipButtonModern) {
        skipButtonModern.click();
      }
    }
  });
}

setInterval(checkAndSkipAds, 1000);
