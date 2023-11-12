setInterval(function() {
  let skipButton = document.querySelector('.ytp-ad-skip-button');
  let skipButtonModern = document.querySelector('.ytp-ad-skip-button-modern');

  if (skipButton) {
    skipButton.click();
  } else if (skipButtonModern) {
    skipButtonModern.click();
  }
}, 1000); // Check every second