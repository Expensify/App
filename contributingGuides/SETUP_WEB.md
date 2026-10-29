# Web Setup Instructions

## Prerequisites

### Web-Specific Prerequisites

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

The Rspack development server now uses https. If you're using a mac, you can simply run `npm run setup-https`.

If you're using another operating system, you will need to ensure `mkcert` is installed, and then follow the instructions in the repository to generate certificates valid for `dev.new.expensify.com` and `localhost`. The certificate should be named `certificate.pem` and the key should be named `key.pem`. They should be placed in `config/rsbuild`.

If you already generated certificates before the Webpack → Rsbuild migration, they're now in the wrong place (`config/webpack`, which no longer exists). Just re-run `npm run setup-https` to regenerate them in `config/rsbuild`, or move the existing files: `mv config/webpack/{key,certificate}.pem config/rsbuild/`.

## Running the Web App

### Development Server
- To run the **development web app**: `npm run web`
- Changes applied to Javascript will be applied automatically via Rsbuild as configured in `config/rsbuild/rsbuild.config.ts`

`npm run web` starts the API proxy, Rsbuild, and the Cloudflare Worker in local workerd through Wrangler. It opens `https://dev.new.expensify.com:8082/` after the Worker serves the app. The Worker uses your existing mkcert certificate and forwards to a private loopback HTTP Rsbuild listener.

React edits use Fast Refresh through the Worker's WSS connection. Worker entry-point and imported module edits (including CSP changes) use Wrangler's native reload without restarting the command or the other services. A new document request/reload is needed to receive changed CSP headers; existing pages do not automatically acquire new response headers.

Optional shell or `.env` settings (shell values take precedence):

```bash
USE_CLOUDFLARE_WORKER=false npm run web # direct HTTPS Rsbuild, API proxy still enabled
USE_WEB_PROXY=false npm run web        # Worker still enabled; use your configured local backend
WEB_PORT=8102 WEB_OPEN=false npm run web # isolated session suitable for Playwright
```

`WEB_PORT` defaults to the first free port from `8082`, and `WEB_INTERNAL_PORT` to the next free port after it, so a second worktree's session starts alongside the first. A port you set explicitly must be free, or startup fails. The API proxy keeps port `9000`: if another session already runs it, the new session reuses it, and its API requests stop working when that session stops. Ctrl-C or a required service exiting stops the remaining services.

Set `EXPENSIFY_URL` and `SECURE_EXPENSIFY_URL` for your local backend and disable `USE_WEB_PROXY` for direct backend requests. Explicit backend origins are added only to the development connection policy. Backend CORS rules and TLS trust still apply; CSP allowances do not bypass them. Third-party OAuth may require an approved origin.

For exact built-asset caching, service-worker, and staging/production CSP checks, use the separate [Worker build preview](../web/cloudflare-worker/README.md#running-a-web-build-locally). Live Rsbuild mode uses development caching and does not exercise Cloudflare's asset store or previous-build R2 fallback.

### Production Build
To build and run the production web build locally:

```bash
# 1. Set USE_WEB_PROXY environment variable in .env.production
USE_WEB_PROXY=true

# 2. Build the production bundle
npm run build

# 3. Run the distribution server
npm run web:dist
```

The `web:dist` command starts both the proxy server (port 9000) and web server (port 8080) concurrently. Access the application at **http://localhost:8080**

## Environment Variables

Creating an `.env` file is not necessary. We advise external contributors against it. It can lead to errors when variables referenced here get updated since your local `.env` file is ignored.

### Key Variables for Web Development
- `NEW_EXPENSIFY_URL` - The root URL used for the website
- `SECURE_EXPENSIFY_URL` - The URL used to hit the Expensify secure API
- `EXPENSIFY_URL` - The URL used to hit the Expensify API
- `EXPENSIFY_PARTNER_NAME` - Constant used for the app when authenticating.
- `EXPENSIFY_PARTNER_PASSWORD` - Another constant used for the app when authenticating. (This is OK to be public)
- `PUSHER_APP_KEY` - Key used to authenticate with Pusher.com
- `USE_WEB_PROXY`⚠️- Used in web development, it starts a server along the local development server to proxy requests to the backend. External contributors should set this to `true` otherwise they'll have CORS errors. If you don't want to start the proxy server set this explicitly to `false`

### Optional Performance Variables
- `CAPTURE_METRICS` (optional) - Set this to `true` to capture performance metrics and see them in Flipper. See [PERFORMANCE.md](contributingGuides/PERFORMANCE.md#performance-metrics-opt-in-on-local-release-builds) for more information
- `ONYX_METRICS` (optional) - Set this to `true` to capture even more performance metrics and see them in Flipper. See [React-Native-Onyx#benchmarks](https://github.com/Expensify/react-native-onyx#benchmarks) for more information
- `USE_WDYR` - Flag to turn [`Why Did You Render`](https://github.com/welldone-software/why-did-you-render) testing on or off

> If your changes to .env aren't having an effect, try `rm -rf .rock`, then re-run `npm run web`

## Testing on Browsers in Simulators and Emulators

The development server is reached through the HTTPS protocol, and any client that access the development server needs a certificate.

You create this certificate by following the instructions in [`Configuring HTTPS`](#configuring-https) of this readme. When accessing the website served from the development server on browsers in iOS simulator or Android emulator, these virtual devices need to have the same certificate installed.

### All Platforms Setup
If you want to set up both iOS and Android simulators at once:
1. Run `npm run setupNewDotWebForEmulators all` or `npm run setupNewDotWebForEmulators`
2. Check if the iOS flow runs first and then Android flow runs.
3. Let the script execute till the message `🎉 Done!`.

## Debugging

### Browser DevTools
To make it easier to test things in web, we expose the Onyx object to the window, so you can easily do `Onyx.set('bla', 1)`.

### Build Profiling (Rspack)
To time, profile, and analyze the Rspack build itself (as opposed to the app's runtime), set the `RSPACK_PROFILE` environment variable on any build or dev server command:

```bash
# Core build process timing (recommended)
RSPACK_PROFILE=OVERVIEW npm run build

# Every trace event - much larger output, only for deep investigation
RSPACK_PROFILE=ALL npm run build
```

This generates a `.rspack-profile-<timestamp>-<pid>/rspack.log` file (JSON Lines) with per-loader/per-plugin timing for the build. To generate a [Perfetto](https://ui.perfetto.dev)-format trace instead, set `RSPACK_TRACE_LAYER=perfetto`:

```bash
RSPACK_TRACE_LAYER=perfetto RSPACK_PROFILE=OVERVIEW npm run build
```

Open the resulting `.rspack-profile-<timestamp>-<pid>/rspack.pftrace` file at [ui.perfetto.dev](https://ui.perfetto.dev) to visualize it. For bundle size (as opposed to build time) analysis, use `npm run analyze-packages`, which runs [Rsdoctor](https://rsdoctor.rs/) against the build output and opens an interactive report covering bundle composition, duplicate packages, and per-loader/per-plugin timing.

### Release Profiling for Web
1. Install the necessary packages: `npm i`
2. Run your web app in production mode
3. Upon completion, the generated source map can be found at: `dist/merged-source-map.js.map`
4. To symbolicate traces: `npm run symbolicate-release:web`

### Recording Traces
1. Launch the app in production mode.
2. Navigate to the feature you wish to profile.
3. Initiate the profiling session by pressing `cmd+d` to open the menu and selecting **`Use Profiling`**.
4. Close the menu and interact with the app.
5. After completing your interactions, press `cmd+d` again and select to stop profiling.
6. You will be presented with a **`Share`** option to export the trace, which includes a trace file (`Profile<app version>.cpuprofile`) and build info (`AppInfo<app version>.json`).

### How to Symbolicate Trace Records
1. You have two files: `AppInfo<app version>.json` and `Profile<app version>.cpuprofile`
2. Place the `Profile<app version>.cpuprofile` file at the root of your project.
3. If you have already generated a source map from the steps above for this branch, you can skip to the next step. Otherwise, obtain the app version from `AppInfo<app version>.json` switch to that branch and generate the source map as described.

**IMPORTANT:** You should generate the source map from the same branch as the trace was recorded.

4. Use the following command to symbolicate the trace: `npm run symbolicate-release:web`
5. A new file named `Profile_trace_for_<app version>-converted.json` will appear in your project's root folder.
6. Open this file in your tool of choice:
   - SpeedScope ([https://www.speedscope.app](https://www.speedscope.app/))
   - Perfetto UI (https://ui.perfetto.dev/)
   - Google Chrome's Tracing UI (chrome://tracing)

## Troubleshooting

### CORS Errors
If you are running into CORS errors like (in the browser dev console):
```sh
Access to fetch at 'https://www.expensify.com/api/BeginSignIn' from origin 'http://localhost:8080' has been blocked by CORS policy
```
You probably have a misconfigured `.env` file - remove it (`rm .env`) and try again

### General Issues
1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. Make sure you have the correct Node version installed as specified in `.nvmrc`
3. Ensure HTTPS is properly configured if you're having certificate issues
4. If the Worker tooling is missing, `npm run web` warns and serves Rsbuild directly. Rerun `npm install` to restore the Worker; it skips the Worker when `CI` is set, and launching the server never installs dependencies. Missing certificates require `npm run setup-https`. Trust the mkcert CA in the browser rather than disabling certificate checks.
5. If the Worker returns `503`, inspect the Rsbuild process output. There is no fallback to an old `dist/` build. If a page appears stale, check for an old service worker in the disposable browser profile.
6. The old ngrok workaround for Wrangler upstream ports is not required: live mode explicitly fetches a loopback HTTP origin. Do not clear CA settings or disable TLS verification to work around unrelated certificate errors.

**Note:** Expensify engineers that will be testing with the API in your local dev environment please refer to [these additional instructions](https://stackoverflow.com/c/expensify/questions/7699/7700).
