# Desktop Setup Instructions

## Prerequisites

### Desktop-Specific Prerequisites

1. **Install mkcert and Setup HTTPS**
   - Install `mkcert`: `brew install mkcert` followed by `npm run setup-https`. If you are not using macOS, follow the instructions [here](https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation).

2. **Configure Local Hosts**
   - Create a host entry in your local hosts file, `/etc/hosts` for dev.new.expensify.com pointing to localhost:
   ```
   127.0.0.1 dev.new.expensify.com
   ```

## Recommended Node Setup
In order to have more consistent builds, we use a strict `node` and `npm` version as defined in the `package.json` `engines` field and `.nvmrc` file. `npm install` will fail if you do not use the version defined, so it is recommended to install `node` via `nvm` for easy node version management. Automatic `node` version switching can be installed for [`zsh`](https://github.com/nvm-sh/nvm#zsh) or [`bash`](https://github.com/nvm-sh/nvm#bash) using `nvm`.

## Configuring HTTPS

The webpack development server now uses https. If you're using a mac, you can simply run `npm run setup-https`.

If you're using another operating system, you will need to ensure `mkcert` is installed, and then follow the instructions in the repository to generate certificates valid for `dev.new.expensify.com` and `localhost`. The certificate should be named `certificate.pem` and the key should be named `key.pem`. They should be placed in `config/webpack`.

## Running the Desktop App

### Development App
- To run the **Development app**: `npm run desktop`
- This will start a new Electron process running on your MacOS desktop in the `dist/Mac` folder.

## Environment Variables

Creating an `.env` file is not necessary. We advise external contributors against it. It can lead to errors when variables referenced here get updated since your local `.env` file is ignored.

### Key Variables for Desktop Development
- `NEW_EXPENSIFY_URL` - The root URL used for the website
- `SECURE_EXPENSIFY_URL` - The URL used to hit the Expensify secure API
- `EXPENSIFY_URL` - The URL used to hit the Expensify API
- `EXPENSIFY_PARTNER_NAME` - Constant used for the app when authenticating.
- `EXPENSIFY_PARTNER_PASSWORD` - Another constant used for the app when authenticating. (This is OK to be public)
- `PUSHER_APP_KEY` - Key used to authenticate with Pusher.com
- `USE_WEB_PROXY`⚠️- Used in web/desktop development, it starts a server along the local development server to proxy requests to the backend. External contributors should set this to `true` otherwise they'll have CORS errors. If you don't want to start the proxy server set this explicitly to `false`

### Optional Performance Variables
- `CAPTURE_METRICS` (optional) - Set this to `true` to capture performance metrics and see them in Flipper. See [PERFORMANCE.md](contributingGuides/PERFORMANCE.md#performance-metrics-opt-in-on-local-release-builds) for more information
- `ONYX_METRICS` (optional) - Set this to `true` to capture even more performance metrics and see them in Flipper. See [React-Native-Onyx#benchmarks](https://github.com/Expensify/react-native-onyx#benchmarks) for more information
- `USE_WDYR` - Flag to turn [`Why Did You Render`](https://github.com/welldone-software/why-did-you-render) testing on or off

> If your changes to .env aren't having an effect, try `rm -rf .rock`, then re-run `npm run desktop`

## Debugging

### Electron DevTools
The desktop app runs in Electron, which provides access to Chrome DevTools for debugging web content within the Electron wrapper.

### Onyx Access
To make it easier to test things in desktop, we expose the Onyx object to the window, so you can easily do `Onyx.set('bla', 1)`.

### Release Profiling for Desktop
1. Install the necessary packages: `npm i`
2. Run your desktop app in production mode
3. Recording traces works similarly to web - use `cmd+d` to access profiling tools
4. Generated source maps and traces can be analyzed using the same tools as web

## Desktop-Specific Features

### Electron Integration
The desktop app uses Electron to wrap the web application, providing:
- Native window management
- System tray integration
- Native notifications
- File system access
- Auto-updater functionality

### Build Configuration
Desktop builds are configured through:
- `desktop/` directory containing Electron-specific code
- `config/electronBuilder.config.js` for build settings
- Platform-specific packaging and distribution

## Troubleshooting

### Electron Issues
1. If Electron fails to start, try clearing the cache: `rm -rf node_modules && npm install`
2. Ensure you have the correct Node version as specified in `.nvmrc`
3. Make sure HTTPS certificates are properly configured

### CORS Errors
If you are running into CORS errors:
- Ensure `USE_WEB_PROXY` is set to `true` in your environment
- Check that the proxy server is running alongside the development server
- Verify that `mkcert` certificates are properly installed

### General Issues
1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. For Electron-specific issues, check the [Electron documentation](https://www.electronjs.org/docs)
3. Ensure all prerequisites are properly installed before running the desktop app

**Note:** Expensify engineers that will be testing with the API in your local dev environment please refer to [these additional instructions](https://stackoverflow.com/c/expensify/questions/7699/7700).
