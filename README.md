<p align="center">
  <img src="Sketch Assets/logo.png" alt="YouTube AutoSkip"/>
</p>

# AutoSkip for YouTube (Browser Extension) 
<a href="https://apps.apple.com/us/app/skiptube/id6502307277?mt=12&itscg=30200&itsct=apps_box_badge&mttnsubad=6502307277">
    <img src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1715126400" alt="Download on the App Store" width="245" height="82" />
</a>

## Description

AutoSkip for YouTube helps you watch YouTube videos without the hassle of ads. With this extension, you’ll enjoy a cleaner viewing experience, free from interruptions—no more waiting for the “Skip” button and no more unskippable ads ruining your flow. Just press play and enjoy.

## Supported browsers

1. **Chromium**

All Chromium browsers (i.e. Chrome, Edge, Brave, Opera) will work the same way, see the installation below.

2. **Safari**

You must build it from scratch or download the universal binary from [here](https://github.com/notarisj/YouTube-AutoSkip/releases/latest).

If you want to build it, you must install Xcode and sign it with your developer certificate or allow unsigned extensions every time you close it. Run the following command:

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

After that, Xcode should open automatically. Build the app and copy it to  `Applications` folder. Open Safari, allow unsigned extensions (if not signed) and enable the extension from settings.

## Installation

1. Clone the repository or download the ZIP file.
2. Extract the files (if you downloaded a ZIP).
3. Open Google Chrome and navigate to chrome://extensions/.
4. Enable 'Developer Mode'.
5. Click on 'Load Unpacked' and select the `SkipTube Extension/resources` folder.
6. Enjoy ad-free YouTube viewing!

## How it Works

The extension now focuses on preventing ads from showing up in the first place rather than trying to skip them. When you load a YouTube video, it immediately replaces the standard YouTube player with the embedded player version of the same video. Because embedded players don’t display ads, there’s no need to detect or skip anything. No complicated button clicks, no speeding through unskippable ads—just a direct switch to a cleaner video source, giving you a smooth, uninterrupted viewing experience every time.

## Troubleshooting

1. Make sure the extension icon lights up blue when visiting YouTube. If not go to Safari settings -> Websites -> SkipTube and select Allow in the dropdown next to youtube.com

## Limitations

* ~~Unskippable Ads: The extension cannot skip ads that do not have the "Skip Ad" option.~~
* YouTube Updates: Changes in YouTube's front-end design or ad mechanisms may affect the extension's functionality.

## Disclaimer

This project is created for educational purposes and personal use. The author has no responsibility for any disruptions or violations of YouTube's terms of service. Users should employ this extension at their own risk and discretion.

## License
This project is open-source and available under the [MIT License](LICENSE).
