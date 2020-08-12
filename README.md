# React Native Chat

## Getting Started
1. Install `node` & `npm`: `brew install node`
2. Install `watchman`: `brew install watchman`
3. Install dependencies: `npm install`
4. (_Optional, but recommended_) Start ngrok (`Expensidev/script/ngrok.sh`), replace `expensify.com.dev` value in `src/CONFIG.js` with your ngrok value

## Running the web app 💻
* To run a **Development Server**: `npm run web`
* To build a **production build**: `npm run build`
* Changes applied to Javascript will be applied automatically

#### Deploying the web app
* The web app automatically deploys via a GitHub Action in `.github/workflows/main.yml`

## Running the iOS app 📱
* To run a on a **Development Simulator**: `npm run ios`
    * If the app is booting on a simulator for the first time, run the following two commands:
    ```bash
    xcrun simctl keychain booted add-root-cert ~/Expensidev/config/ssl/rootCA.crt #Adds root cert and trusts it
    xcrun simctl keychain booted add-cert ~/Expensidev/config/ssl/expensify.com.dev.pem #Adds .dev cert and trusts it
    ```
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

## Running the Android app 🤖
* Running via `ngrok` is required, see step 3 in **_Getting Started_**
* To run a on a **Development Emulator**: `npm run android`
* Changes applied to Javascript will be applied automatically, any changes to native code will require a recompile

#### Deploying the iOS & Android app
* To deploy the app run: `npm run deploy`
* To build a APK to share run: `Build > Generate Signed Bundle / APK...` from Android Studio 

## Running the tests 🎰
* To run the **Jest Unit Tests**: `npm run test`

## Troubleshooting
1. If you are having issues with **_Getting Started_**, please reference [React Native's Documentation](https://reactnative.dev/docs/environment-setup)
2. If you are running into issues communicating with `expensify.com.dev` (CORS, SSL, etc.), running via `ngrok` is recommended, see step 3 in **_Getting Started_**

## Debugging
1. If running on the iOS simulator `⌘D`, or `⌘M` on Android emulator will open the debugging menu. 
2. This will allow you to attach a debugger in your IDE, React Developer Tools, or your browser. 
3. For more information on how to attach a debugger, see [React Native Debugging Documentation](https://reactnative.dev/docs/debugging#chrome-developer-tools)
