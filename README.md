AutoSkip for YouTube (Chrome Extension)

## Description

AutoSkip for YouTube is a Chrome extension designed to enhance the YouTube viewing experience by automatically skipping ads. I initially intended to skip ads only after the waiting time, surprisingly it skips ads right from the start. However, it's important to note that it does not work with unskippable ads.

## Installation

1. Clone the repository or download the ZIP file.
2. Extract the files (if you downloaded a ZIP).
3. Open Google Chrome and navigate to chrome://extensions/.
4. Enable 'Developer Mode' at the top-right corner.
5. Click on 'Load Unpacked' and select the extracted folder.
6. Enjoy ad-free YouTube viewing!

## How it Works

The extension uses a content script that periodically checks for the "Skip Ad" button on YouTube, clicking it when found. While effective, this periodic checking could be further optimized.

## Limitations

* Unskippable Ads: The extension cannot skip ads that do not have the "Skip Ad" option.
* YouTube Updates: Changes in YouTube's front-end design or ad mechanisms may affect the extension's functionality.

## Disclaimer

This project is created for educational purposes and personal use. The author has no responsibility for any disruptions or violations of YouTube's terms of service. Users should employ this extension at their own risk and discretion.

## License
This project is open-source and available under the [MIT License](LICENSE).