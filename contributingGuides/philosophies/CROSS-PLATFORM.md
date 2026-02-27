# Cross Platform Philosophy
Learn how the app supports features across all our different platforms.

Currently supported platforms:
- Web
- Mobile Web
- iOS
- Android

The goal is: **Cross Platform 99.9999%**

## Rules
### - Features MUST be implemented on all supported platforms
A feature isn't done until it works on all platforms. Any platform-specific code blocks will be asked to be undone.

### - React Native bugs MUST be fixed upstream
If the reason cross-platform code cannot be written is because there is a bug in ReactNative that is preventing it from working, the correct action is to fix RN and submit a PR upstream -- not to hack around RN bugs with platform-specific code paths.

While upstream PRs are waiting to be merged, a patch can be used which is managed by the NPM package `patch-package`. Read more about it [here](https://github.com/Expensify/App?tab=readme-ov-file#adding-hybridapp-related-patches).

### - Features that don't exist on all platforms MUST use NOOP shims
If there is a feature that simply doesn't exist on all platforms and thus doesn't exist in RN, rather than doing `if (platform=iOS) { }`, instead write a "shim" library that is implemented with NOOPs on the other platforms.  For example, rather than injecting platform-specific multi-tab code (which can only work on browsers, because it's the only platform with multiple tabs), write a TabManager class that just is NOOP for non-browser platforms.  This encapsulates the platform-specific code into a platform library, rather than sprinkling through the business logic.

### - Platform specific code MUST be placed in dedicated files and folders
Put all platform specific code in dedicated files and folders (see below) and reject any PR that attempts to put platform-specific code anywhere else.  This maintains a strict separation between business logic and platform code.

## Platform-Specific File Extensions
In most cases, the code written for this repo should be platform-independent. In such cases, each module should have a single file, `index.js`, which defines the module's exports. There are, however, some cases in which a feature is intrinsically tied to the underlying platform. In such cases, the following file extensions can be used to export platform-specific code from a module:
- Mobile => `index.native.js`
- iOS Native App/Android Native App => `index.ios.js`/`index.android.js`
- Web => `index.website.js`

**Note:** `index.js` should be the default and only platform-specific implementations should be done in their respective files. i.e: If you have mobile-specific implementation in `index.native.js`, then the web implementation can be contained in a shared `index.js`.

`index.ios.js` and `index.android.js` are used when the app is running natively on respective platforms. These files are not used when users access the app through mobile browsers, but `index.website.js` is used instead. `index.native.js` are for both iOS and Android native apps. `index.native.js` should not be included in the same module as `index.ios.js` or `index.android.js`.

### Supporting Mobile Web
The above platform-specific files only work because they are compiled when the app is built for the different platforms. This means that a different mechanism needs to be used for Mobile Web (since "mobile web" and "web" are the same at build time).

It is also well known that different mobile browsers have different quirks and need to use different workarounds at times.

#### - Mobile browser detection SHOULD never be used
If there is absolutely no other way to fix a bug, then the proper way of detecting the browser is using `@libs/Browser`. Use this as an absolute last resort and have the exception approved by several (ie. more than one) internal engineers.
