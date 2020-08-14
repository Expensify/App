# React Native Chat

## Getting Started
1. Install `node` & `npm`: `brew install node`
2. Install `watchman`: `brew install watchman`
3. Install dependencies: `npm install`
4. Update `api.php` in [Web-Expensify](https://github.com/Expensify/Web-Expensify/blob/3ae46d91a037db3ae6bdefa3b82313431759565f/api.php#L22) to add the following headers to avoid CORS issues
    ```
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Credentials: *');
    ```
5. Run `cp .env.example .env` and edit `.env` to have your local config options


## Running the web app 💻
* To run a **Development Server**: `npm run web`
* To build a **production build**: `npm run build`
* Changes applied to Javascript will be applied automatically

#### Deploying the web app
* The web app automatically deploys via a GitHub Action in `.github/workflows/main.yml`

## Running the iOS app 📱
* To install the iOS dependencies, run: `cd ios/ && pod install`
* To run a on a **Development Simulator**: `npm run ios`
    * If the app is booting on a simulator for the first time, run the following two commands:
    ```bash
    xcrun simctl keychain booted add-root-cert ~/Expensidev/config/ssl/rootCA.crt #Adds root cert and trusts it
    xcrun simctl keychain booted add-cert ~/Expensidev/config/ssl/expensify.com.dev.pem #Adds .dev cert and trusts it
    ```
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

## Running the Android app 🤖
* Running via `ngrok` is required to communicate with the API
    * Start ngrok (`Expensidev/script/ngrok.sh`), replace `expensify.com.dev` value in `src/CONFIG.js` with your ngrok value
* To run a on a **Development Emulator**: `npm run android`
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

#### Deploying the iOS & Android app
* To install the required tools to deploy, run `bundle install` from the root of this project
* To deploy the app run: `npm run deploy`
* To build an APK to share run (e.g. via Slack): `Build > Generate Signed Bundle / APK...` from Android Studio 

## Running the tests 🎰
* To run the **Jest Unit Tests**: `npm run test`

## Troubleshooting
1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. If you are running into issues communicating with `expensify.com.dev` (CORS, SSL, etc.), running via `ngrok` is recommended, see step 3 in **_Getting Started_**

## Debugging
1. If running on the iOS simulator `⌘D`, or `⌘M` on Android emulator will open the debugging menu. 
2. This will allow you to attach a debugger in your IDE, React Developer Tools, or your browser. 
3. For more information on how to attach a debugger, see [React Native Debugging Documentation](https://reactnative.dev/docs/debugging#chrome-developer-tools)
