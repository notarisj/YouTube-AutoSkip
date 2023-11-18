# AutoSkip for YouTube (Chrome Extension) 

## Description

AutoSkip for YouTube is a Chrome extension designed to enhance the YouTube viewing experience by automatically skipping ads. I initially intended to use a script that clicked the "Skip ad" button when it appeared. It turns out that it is available in the source code from the start so it is possible to skip the ad without waiting for 5 seconds. When it detects an ad but fails to find the skip button, this happens with the unskippable ads, it will mute and speed it up so it is almost unnoticeable. I guess this also counts as watching the full ad.

## Other browsers

1. **Chromium**

All Chromium browsers (i.e. Chrome, Edge, Brave, Opera) will work the same way, see the installation below.

2. **Safari**

It is possible to run in Safari but it requires Xcode to build. You must sign it with your certificate or allow unsigned extensions every time you close it. Run the following command:

```bash
xcrun safari-web-extension-converter /path/to/YouTube-AutoSkip/src --macos-only --app-name "YouTube AutoSkip"
```

If everything is correct you should see:

```bash
Xcode Project Location: /Users/<username>
App Name: YouTube AutoSkip
App Bundle Identifier: com.yourCompany.YouTube-AutoSkip
Platform: macOS
Language: Swift
```

After that Xcode should open automatically. Build the app and copy it to `Applications` folder. Open Safari, allow unsigned extensions and enable the extension from the settings.

## Installation

1. Clone the repository or download the ZIP file.
2. Extract the files (if you downloaded a ZIP).
3. Open Google Chrome and navigate to chrome://extensions/.
4. Enable 'Developer Mode' at the top-right corner.
5. Click on 'Load Unpacked' and select the extracted folder.
6. Enjoy ad-free YouTube viewing!

## How it Works

The extension uses a content script that periodically checks for the "Skip ad" button. When it is available it presses it. When the button is not available, with unskippable ads, it will verify that `ytp-ad-player-overlay` exists and it will mute the audio and set the playback rate to 10x. While effective, this periodic checking could be further optimized using `MutationObserver`.

## Limitations

* ~~Unskippable Ads: The extension cannot skip ads that do not have the "Skip Ad" option.~~
* YouTube Updates: Changes in YouTube's front-end design or ad mechanisms may affect the extension's functionality.

## Disclaimer

This project is created for educational purposes and personal use. The author has no responsibility for any disruptions or violations of YouTube's terms of service. Users should employ this extension at their own risk and discretion.

## License
This project is open-source and available under the [MIT License](LICENSE).
