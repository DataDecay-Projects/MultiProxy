# MultiProxy

MultiProxy is a simple and clean UI for accessing multiple proxy services without the hassle of intrusive ads. It allows people to select from preset proxy sites, save custom configurations, and quickly bypass the proxy server UI.

## Features

- **Preset Proxy Sites**: Choose from a list of predefined proxy services.
- **Custom Proxy Sites**: Add and save your own proxy configurations.
- **Quick Access Tiles**: Create and manage quick access tiles for frequently used URLs.
- **Encoding Options**: Supports multiple encoding methods like XOR, Base64, and more.
- **Notification System**: Provides feedback for user actions.
- **Responsive Design**: Clean and simple UI for seamless user experience.

## Usage

1. **Select a Proxy Site**:
   - Navigate to the "Select Proxy Site" page.
   - Choose a proxy from the preset list or add a custom proxy.

2. **Bypass a URL**:
   - Enter the URL you want to bypass in the input field.
   - Click the "Bypass!" button to open the bypassed link in a new tab.

3. **Quick Access Tiles**:
   - Add frequently used URLs as tiles for quick access.
   - Customize tile colors and labels.

4. **Save Custom Proxies**:
   - Add a custom proxy by entering its name, URL, and encoding method
        - If it looks like this, `hvtrs8%2F-ezaopne%2Ccmm`, then select XOR codec.
        - If it looks like this, `https%3A%2F%2Fexample.com`, then select only url encoding
        - If it looks like this, `aHR0cHMlM0ElMkYlMkZleGFtcGxlLmNvbQ==`, then select base65 encoding
   - Save it for future use.

## Host it yourself

This project is ready for Github Pages!

If you just want to access it, then go [here](https://multiproxy.datadecay.dev)!

1. Fork it by selecting `Fork`,
2. When it forks go to `Settings`, then click on `Pages` in the sidebar.
3. Click `Source` then select `Github Actions`

## Configuration

In your fork, mentioned in `Host it Yourself`, click on the filename `presets.json`. You can now press `edit` and edit the default proxies. Copy and paste this premade code block at the marker: ```{
      "id": "TYPE-NEXT-ID-HERE",
      "name": "TYPE-NAME-OF-PROXY-HERE",
      "host": "INSERT-PROXY-SERVICE-URL-HERE",
      "codec": "PREDETERMINED-CODEC"
    },```

## Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request.

## Acknowledgments

- Hosted with GitHub Pages.
- Made for [The Bubble](https://sites.google.com/students.wcpss.net/the-bubble-is-goated/).