# What is HybridApp?
Every React Native mobile application needs native codebase with an entry point, known as `ReactRootView`. Depending on the platform the implementation differs. Nevertheless as a rule of thumb we can say that React Native just needs a **native** screen where JavaScript runtime can manipulate components and views. 

It means that whenever we create a React Native application from scratch we instantiate it on a (very basic, bare) native codebase. However, we can always use a different, already existing codebase to run React Native. This is how we've built HybridApp - we've created a new `ReactRootView`, and taken all JavaScript code to run it within the existing mobile application (OldDot).

It means that HybridApp is a **regular native application**, which has an additional screen that runs React Native. HybridApp let us combine New Expensify and our classic app into a single mobile app for a seemless migration
# How is HybridApp built?
If you have access to the closed-source `Mobile-Expensify` repository, you are eligible to build HybridApp. The main difference between NewDot and HybridApp is that the native code is located in a different place. The native code is located under `./Mobile-Expensify/Android` and `./Mobile-Expensify/iOS`.

It is vital to understand, that modifying any code in `./android` and `./ios` folders in the root of the project **will not affect the HybridApp build at all.** In this case, if you'd like to change native code, you have to go to `./Mobile-Expensify/Android` and `./Mobile-Expensify/iOS` first. This is **especially important** when you want to remove native cache or `Pods` manually. 
# How do the scripts work?
While working on the HybridApp we've prepared a set of scripts to make the work with HybridApp easier. In general, the scripts `npm install`, `npm run clean`, `npm run android`, and `npm run ios` work on the following condition:

**If you have cloned HybridApp to `Mobile-Expensify` submodule, the default behaviour of the scripts changes to build HybridApp instead of NewDot.**

In that case, what are the differences in each script?

## `npm install`
- **Without access to HybridApp**: 
	1. install `node_modules` in `./` 
	2. apply patches from `./patches`
- **With a cloned Mobile-Expensify submodule**: 
	1. install `node_modules` in `./` 
	2. apply patches from `./patches`
	3. cd to `Mobile-Expensify`
	4. install `node_modules` for OldDot
	5. apply patches from `./Mobile-Expensify/patches` -> for more info refer to [Patches](#Patches)

## `npm run clean`
- **Without access to HybridApp**: 
	1. clean all caches for NewDot by running `npx react-native clean-project-auto` 
	2. remove the following (you can find full documentation [here](https://github.com/pmadruga/react-native-clean-project?tab=readme-ov-file#content))
		- `./node_modules`
		- `./ios/Pods`
		- `./ios/build`
		- `./android/build`
- **With a cloned Mobile-Expensify submodule**: 
	1. remove the following: 
		- `./node_modules`
		- `./Mobile-Expensify/node_modules`
		- `./Mobile-Expensify/Android/.cxx`
		- `./Mobile-Expensify/Android/.gradle`
		- `./Mobile-Expensify/Android/build`
		- `./Mobile-Expensify/iOS/Pods`
		- `./Mobile-Expensify/iOS/build`

The scripts will also remove some deeper hidden cache, but crucial thing to understand is that cache for HybridApp are *mostly* located in `Mobile-Expensify` submodule, alongside the native code.

## `npm run android` and `npm run ios`
- **Without access to HybridApp**: 
	1. build and install standalone NewDot
- **With a cloned Mobile-Expensify submodule**: 
	1. build and install HybridApp

## `npm run pod-install`
This is a helper script that lets you install `Pods` without changing directories. Thanks to it, you can keep working in the root of the project (`./`), and still be able to install iOS dependencies.
- **Without access to HybridApp**: 
	1. install `Pods` in `./ios`
- **With a cloned Mobile-Expensify submodule**: 
	1. install `Pods` in `./Mobile-Expensify/iOS`

# What should I do to build HybridApp?
The build should be very straightforward. Assuming you've cleared cache, and have just cloned the `Mobile-Expensify` submodule, you should do the following:
1. `npm i`
2. `npm run pod-install` (if you build iOS)
3. `npm run ios` or `npm run android`
If you encounter any problems, please refer to the [[#Pro Tips & Troubleshooting]] section, or (if you don't find your answer there) remove the cache by executing `npm run clean`

# Submodules
OldDot code in `Expensify/App` repo is located in `Mobile-Expensify` directory, which technically is a git submodule. Even though it seems like an advanced concept, in reality it is very straightforward: it basically sets a commit hash from which `Mobile-Expensify` code should be pulled.

In practice a submodule is just a regular git repository, set to a specific commit. However, if you need to push changes to `Mobile-Expensify`, you can do all the same things as on a regular repository like: changing branches, pulling and pushing to a remote repository etc. 

If you change the `Mobile-Expensify` code, it will be seen by `Expensify/App` as a commit hash change that may be pushed to a remote repository. Currently we automatically update the `Mobile-Expensify` commit hash, therefore you don't need to do it manually. In order to avoid confusion you can update your `.git/config` by running the following command: `git config submodule.Mobile-Expensify.ignore all`. This way you won't accidentally change the commit hash for the submodule in your PR.
## Useful commands

IMPORTANT: Please execute the following commands form the root of the project!
- `git submodule update --init` 
	- it initialises the submodule, and pulls the `Mobile-Expensify` code from the commit set in `Expensify/App`. 
	- **IMPORTANT**: If you already have the `Mobile-Expensify` code, you don't need to run the command with `--init` flag.
- `git submodule update` 
	- it pulls the `Mobile-Expensify` code from the commit set in `Expensify/App`. 
	- **very similar to:** `git checkout <COMMIT_HASH>`
- `git submodule update --remote` 
	- it pulls the `Mobile-Expensify` code from the newest `main` on the remote repository.
	- **very similar to:** `git checkout main` 

# Patches
There is a set of patches, that gets applied only to HybridApp. They are not required by a standalone NewDot build, therefore they have been located in `./Mobile-Expensify/patches`. If you'd like to add a new HybridApp specific patch you can run:
1. `npx patch-package <PACKAGE_NAME> --patch-dir Mobile-Expensify/patches`

The `patch-package` takes `.patch` files, and applies the diff to `node_modules` after executing `npm install`. It means that if you'd like to build NewDot after HybridApp, it is best to remove `node_modules`, and run `npm run i-standalone` to make sure that HybridApp-specific patches won't be applied.
# Environmental variables
If you need to setup your local environment, you can create a `.env` file in the root of the project (aka `Expensify/App`). The variables will be included into the **native build**, which means that in case of HybridApp they will be also visible on the OldDot side. There is no need to have another `.env` file in `Mobile-Expensify`.

If there are some connection problems with your local backend, please make sure you've included `ENVIRONMENT=development` in your `.env` file.
# Pro Tips & Troubleshooting
## General

### My build has just failed. What should I do?
There are multiple thing that may cause the build to fail. This is a simple checklist that may help you with debugging:
1. Read the error carefully - sometimes it explains the problem very well
2. Look for a similar error in the Troubleshooting section
3. Pull the newest `main`
4. Check if you have a recent version of the `Mobile-Expensify` submodule
	- if not, execute `git submodule update`, and rerun the build
5. Clean the cache by executing `npm run clean` (with proper platform flags)
If the problem still exists, please share the error in the #expensify-open-source channel
### What if I want to build a standalone NewDot?
There are additional helper scripts, that will help you to run a standalone NewDot, even if you have access to `Mobile-Expensify`, and the default behaviour of the scripts builds HybridApp. 

In this case you can do the following:
1. `rm -rf node_modules`
2. `npm i-standalone`
3. `npm run pod-install-standalone` (required only if you build iOS)
4. `npm run ios-standalone` or `npm run android-stanalone`

Alternatively, you may notice in `package.json` that all these scripts are based on `STANDALONE_NEW_DOT` environment variable. If you feel confident you can do `export STANDALONE_NEW_DOT=true` to change the default behaviour in the current process of the terminal, and use regular commands (`npm i`, `npm run android`, `npm run ios` etc.) to build NewDot. 

### Do I need to clean cache and rebuild the app?
It's a valid question, especially because clean builds may take some time. On the way I've noticed that many developers tend to rebuild the app from scratch, even though in some cases it is unnecessary. In this case, when should you rebuild the app?
1. Whenever any code located in `./Mobile-Expensify` has changed - this means that we need to recompile OldDot/native code
2. Whenever you've pulled the newest main - not always necessary, but usually we don't analise what code has just been merged by `git pull`
3. Whenever `package-lock.json` has changed - this may indicate that some packages with native code were bumped (however it's not always necessary, see [[#Should I rebuild HybridApp after bumping a `node_module`?]])
4. Whenever you've updated `.env` files
This means that if you changed only React Native code, and didn't pull any changes, the rebuilt is probably not necessary. If something doesn't work, you can always restart the Metro bundler using the following command `npm run start --reset-cache`
### Should I rebuild HybridApp after bumping a `node_modules` library?
The `package-lock.json` file contains information about exact versions of `node_modules` that will be installed on your machine. If you've bumped a dependency on your PR you can easily check to see if you would need to rebuild the app by going to the `./node_modules/<PACKAGE_NAME>`, and seeing if there are any Objective-C, Swift, Java, Kotlin or C++ files. Usually they are located in `ios` or `android` folders.
### How to clear platform-specific cache?
Executing `npm run clean` clears cache for React Native, Android, and iOS. It means that the whole process may take a while, even though you try to build only one platform. In this case you case you can pass additional arguments to specify which cache should be cleared in order to save some time:
- **React Native:** `npm run clean -- --react-native` 
	- `npm`, `node_modules`, `watchman`, Metro
- **Android:** `npm run clean -- --android` 
	- `build`, `.cxx`, `.gradle`
- **iOS:** `npm run clean -- --ios`
	- `Pods`, `DerivedData`, `build`, `cocoapods`
- **YAPL**: `npm run clean -- --npm`
	- `npm`, `Mobile-Expensify/node_modules` (OldDot-specific)
## Android
### Error: `Could not find method autolinkLibrariesFromCommandForPath()`

This is an error that indicates, that patches from `./Mobile-Expensify/patches` were not applied. In this case:
1. open a new terminal
2. run `rm -rf node_modules && npm i`
3. run `npm run android`
### Error: `A problem occurred starting process 'command 'node''`

Android Studio for some reason sometimes is unable to find `node`, even though its terminal has correct access to all environment variables. According to StackOverflow's threads the problem started appearing in 2021. In some cases linking node worked (`sudo ln -s "$(which node)" /usr/local/bin/node`), but the easiest way is to open Android Studio directly from terminal:
1. close Android Studio
2. run `open -a /Applications/Android\ Studio.app`
### Error: `> Task :installDebug FAILED`

Actually you should be happy whenever you see this error - it means that the build failed, but the `.apk` hasn't been installed on your device/emulator. In order to fix this, refer to: [[#How to find an `.apk`, and install it on your device?]]

IMPORTANT: It's easily to confuse this error with a very similar one: `Failed to install the app. Command failed with exit code 1: ./gradlew installDebug`. In fact, this one may have many possible reasons, and in order to debug it correctly, you should look for a Gradle **Task** that failed. 
### Error: `undefined is not an object (evaluating 'Store.ReportHistory.bindCacheClearingEvents')`
This error indicates that YAPL JS (OldDot's JavaScript code) hasn't been built properly. In order to fix that, do the following:
1. cd to `Mobile-Expensify`
2. run `npm run grunt:build:shared`
### How to find an `.apk`, and install it on your device?

After a successful build, gradle creates an `.apk` file, which you can install on your android devices/emulators. There is a chance that eg. the app failed to install after a successful build, or you want to test the app on another device. In this case you **don't need to rebuild the app**, because you can reuse the existing `.apk`. These are the steps how to do it:
1. run `adb devices` - you should have only one device listed
   - **if there are no devices connected**: open an emulator, or connect a physical device
   - **if there are multiple devices**: close the devices you don't use
2. install HybridApp
   - **if you've build debug:** `adb install -r Mobile-Expensify/Android/build/outputs/apk/debug/Expensify-debug.apk`
   - **if you've build release**: `adb install -r Mobile-Expensify/Android/build/outputs/apk/release/Expensify-release.apk`

This way the debug app will get installed from the terminal. Alternatively you can open Finder and go to the directory where the `.apk` is located. Then you can drag the file directly to the emulator screen.

You can do a similar thing for NewDot if you know the path to the generated `.apk`. In this case you can reuse the `adb install` command providing a different path.

If you'd like to list all available `.apk`s to install them on your device you can run the following commands:
- **HybridApp**: `find Mobile-Expensify/Android/build/outputs -name "*.apk`
- **NewDot:** `find android/app/build/outputs -name "*.apk` 
### Build HybridApp in the `release` configuration
If you'd like to build HybridApp in `release` configuration you need to adjust one thing in the code, and run the build manually from the terminal. 
1. open `./Mobile-Expensify/Android/build.gradle` file
2. change `signingConfig signingConfigs.release` line to `signingConfig signingConfigs.debug`
3. cd  to `Mobile-Expensify/Android`
4. run `./gradlew installRelease`
### How to see native logs in Android Studio?
The easiest way to see native logs is to use Logcat. In order to find it go to: `View` > `Tool windows` > `Logcat`
## iOS
### Error: `undefined method [] for nil`
It's an error that you may encounter while executing `npm run pod-install`. Unfortunately it's very generic, and indicates an error in some React Native CLI script. In order to debug it, you have to get deeper into JS script files of the `@react-native-community/cli` package. If you haven't changed anything in the `Podfile`, or haven't bumped `react-native` the best thing to do is to remove and reinstall `node_modules` and make sure all patches were applied correctly.

### Error: `"xcodebuild" exited with error code '65'`
This is a very common error that may appear during an iOS build, it's especially annoying when it appears after executing `npm run ios`, because it doesn't give any additional information that may be useful for debugging. In order to see the real error you need to open XCode and rerun the build from there. When the build fails, pick `Errors Only` in the main panel, and extend the error by pressing an icon with 4 parallel lines on the right hand side. On the very bottom you should see the real error.

### Error: `MsgHandlingError(message: "unable to initiate PIF transfer session (operation in progress?)")`
This is pretty common in XCode, but it's easy to fix. Usually it means that you've executed `npm run pod-install` with XCode being open, and the IDE didn't handle the `Pods` changes well. To fix it:
1. restart XCode

### Error: `FullstoryCommandLine` 
This one is pretty enigmatic, and usually appears after subsequent android, and ios debug builds. In this case:
1. close Metro
2. rerun the iOS build

### Error: `CDN: trunk URL couldn't be downloaded`
This error may appear after execution of `npm run pod-install`. In this case you shaould do the following:
1. cd to `Mobile-Expensify/ios`
2. run `pod repo remove trunk`

### How to build a `release` iOS app?
If you'd like to build HybridApp in `release` configuration, the best way to do it is to:
1. open XCode
2. go to `Product` > `Scheme` > `Edit scheme`
3. in the opened window go to `Run` section, and choose `Info` tab 
4. pick `release` instead of `debug` for `Build Configuration`

Remember, that `release` configuration may not work fine on physical devices, if you don't have proper permissions, and ProvisioningProfile. The simulator should build without problems.

### How to see native logs in XCode?
One option is to run the build directly from XCode and you'll see the logs appearing in a section below. However, if you already have the app running, you don't have to rebuild it, the only thing you need to do is to attach the debugger to the correct process by going to `Debug` > `Attach to Process` > `Expensify`
