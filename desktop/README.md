<div align="center">
    <div style="display: flex; justify-content: center; align-items: center;">
        <a href="https://new.expensify.com">
            <img src="https://raw.githubusercontent.com/Expensify/App/main/web/favicon.png" width="64" height="64" alt="New Expensify Icon">
        </a>
        <h1 style="margin: 24px">+</h1>
        <a href="https://www.electronjs.org/">
            <img src="https://raw.githubusercontent.com/Expensify/App/main/desktop/electron.png" width="64" height="64" alt="Electron Icon"/>
        </a>
    </div>
    <h1>
        <a href="https://new.expensify.com">
            New Expensify
        </a>
        +
        <a href="https://www.electronjs.org/">
            Electron
        </a>
    </h1>
</div>

#### Table of Contents

* [Architecture](#architecture)
* [Testing Electron Auto-Update](#testing-electron-auto-update)
* [Packaging](#packaging)

# Architecture
The New Expensify desktop app is built using [Electron.js](https://www.electronjs.org/). We try our best to maintain Electron best practices, particularly when it comes to [security](https://www.electronjs.org/docs/latest/tutorial/security). 

The desktop app is organized in three pieces:

1. The Electron main process 
   - Implemented in https://github.com/Expensify/App/blob/main/desktop/main.js.
   - This file has access to the full set of Electron and Node.JS APIs. 
2. The Electron renderer process
   - This is the webpack-bundled version of our react-native-web app (except using `index.desktop.js` files instead of `index.website.js`, where applicable)
   - This is _very_ similar to our web app, and code in this process should assume it will be run in the context of a browser (no access to `require`, Electron, or Node.js APis)
3. The context bridge
   - Implemented in https://github.com/Expensify/App/blob/main/desktop/contextBridge.js
   - The context bridge enables communication between the main and renderer processes. For example, if the renderer process needs to make use of a Node.js or Electron API it must:
     1. Define an event in https://github.com/Expensify/App/blob/main/desktop/ELECTRON_EVENTS.js
     2. Add that event to the whitelist defined in the context bridge
     3. Set up a handler for the event in the main process that can respond to the renderer process back through the bridge, if necessary.

# Testing Electron Auto-Update
Testing the auto-update process can be a little involved. The most effective way to test this involves setting up your own release channel locally and making sure that you can notarize your builds.

**Note:** In order to test with a notarized build you'll need to have a paid Apple developer account.

## Setting up Min.IO
Rather than pushing new builds to the production S3 bucket, the best way to test locally is to use [Min.IO](https://min.io). Min.IO is an S3-compatible service that you can set up and deploy locally. In order to set up a local Min.IO instance to emulate an S3 bucket, follow these steps:

If you've already gone through the setup below, you can just run step 3 and then move on to the next section.

1. Install Min.IO on your local machine via brew
```
brew install minio/stable/minio
brew install minio/stable/mc
```
2. Create a directory in the root for electron-updater data
```
mkdir -p ~/data/electron-updater
```
3. Start the local server. Take note of the RootUser and RootPass values that show up after running this command, we'll need these in the next step
```
minio server ~/data/
```
4. Verify that the Min.IO local server is up-and-running by going to localhost:9000 in your browser, and logging in with the `RootUser` and `RootPass`. You should then see an interface like this:
![electron-updater](https://user-images.githubusercontent.com/3981102/120375994-38641000-c2d0-11eb-8636-b7d59cb82af3.png)
5. Create a testing bucket with mc (minio client)
```
mc config host add electron-builder http://YOUR_LOCAL_IP:9000 [RootUser_value] [RootPass_value]
mc mb electron-builder/electron-builder
```
6. Verify that the new bucket has been created by navigating to https://localhost:9000/minio/electron-builder in your browser and confriming you see an interface like this:
![electron-builder](https://user-images.githubusercontent.com/3981102/120376267-8842d700-c2d0-11eb-86cb-f595f27d535d.png)

7. Set your testing bucket to be public, which will allow the NewExpensify.dmg access the local latest-mac.yml file we'll be publishing
```
mc policy set public electron-builder/electron-builder
```

**Note:** while the `electron-updater` docs tell you to create a file named `dev-app-update.yaml`, this will **not** be helpful. Setting that file will, in development, tell the auto-updater where to look for builds. Unfortunately, on Mac the auto-updater will not install the new build unless the app that is currently running is signed.

## Local Changes to the App

Once you have Min.IO setup and running, the next step is to temporarily revert some changes from https://github.com/Expensify/App/commit/b640b3010fd7a40783d1c04faf4489836e98038d, specifically

1. Update the `desktop-build` command in package.json to add `--publish always` at the end
2. Update electronBuilder.config.js to replace the `publish` value with the following:
```
 publish: [{
   provider: 's3',
   bucket: 'electron-builder',
   endpoint: 'http://localhost:9000',
   acl: 'public-read',
   channel: 'latest',
 }]
```

## Setting up credentials for notarizing your build

If you've already created a Certificate Signing Request and an app-specific password for your local desktop testing app, you can continue to the next section.

Before you can upload a build, you need to make sure that you can notarize builds. For this you will need an [Apple Developer](https://developer.apple.com) account. Go to the [Certificates, Identifiers, and Profiles](https://developer.apple.com/account/resources/certificates/list) page and create a new certificate for a `Developer ID Application` (see the bottom option of the screenshot below)

<img src='https://user-images.githubusercontent.com/3981102/120376440-c0e2b080-c2d0-11eb-858a-31dd409efe87.png' width='500'/>

Follow the instructions to create a Certificate Signing Request, and once the certificate has been created, add it to your keychain with the Keychain Access app.

You will need to pass your Apple ID (username) and an [app-specific password](https://appleid.apple.com/account/manage) to the environment of the local desktop build. Entering your normal password will not work, so generate an app-specific password before continuing. Make sure you write down the app-specific password since you'll need to pass it to the desktop-build command.

## Pushing a build to Min.IO

Now that your credentials have been set up properly, you can push a build to Min.IO. Start by updating the version value in package.json to be much higher than it is currently (1.0.0-0 -> 2.0.0-0) so that the uploaded version is always higher than the version you're testing on. Then run the following, where RootUserKey and RootPassKey are the RootUser and RootPass values from step 3:

```
AWS_ACCESS_KEY_ID=RootUserKey AWS_SECRET_ACCESS_KEY=RootPassKey APPLE_ID=YOUR_APPLE_ID APPLE_ID_PASSWORD=YOUR_APP_SPECIFIC_PW npm run desktop-build
```

This command will create a build, notarize it, and push your build to the server. Note that it can take around 10 minutes for the command to complete.

Once the command finishes, revert the version update in `package.json`, remove `--publish always` from the `desktop-build` command, and again run the `npm run desktop-build` command above **including the args**. After the build is done, you'll find `NewExpensify.dmg` in the `dist/` folder in the root of the project. Open the `.dmg` and install the app. Your app will attempt to auto-update in the background.

# Packaging
To avoid bundling unnecessary `node_modules` we use a [2 package structure](https://www.electron.build/tutorials/two-package-structure)
The root [package.json](../package.json) serves for `devDependencies` and shared (renderer) `dependencies`
The [desktop/package.json](./package.json) servers for desktop (electron-main) specific dependencies
Webpack uses root package dependencies and src to bundle the web application loaded by Electron's renderer process in `desktop/dist/www` - all necessary dependencies are copied to that folder
We use Webpack again to bundle the `main` scripts that init electron and render `www` content.

## See what is getting packaged in the app
You can inspect the app package content in the `desktop-build` folder 
To see the actual `app.asar` content run the following script
```shell
npx asar extract desktop-build/mac/New\ Expensify.app/Contents/Resources/app.asar ./unpacked-asar
```
