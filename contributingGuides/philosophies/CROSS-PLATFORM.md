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
- Web => `index.web.js`

**Note:** `index.js` should be the default and only platform-specific implementations should be done in their respective files. i.e: If you have mobile-specific implementation in `index.native.js`, then the web implementation can be contained in a shared `index.js`.

`index.ios.js` and `index.android.js` are used when the app is running natively on respective platforms. These files are not used when users access the app through mobile browsers, but `index.web.js` is used instead. `index.native.js` are for both iOS and Android native apps. `index.native.js` should not be included in the same module as `index.ios.js` or `index.android.js`.

### Supporting Mobile Web
The above platform-specific files only work because they are compiled when the app is built for the different platforms. This means that a different mechanism needs to be used for Mobile Web (since "mobile web" and "web" are the same at build time).

It is also well known that different mobile browsers have different quirks and need to use different workarounds at times.

#### - Mobile browser detection SHOULD never be used
If there is absolutely no other way to fix a bug, then the proper way of detecting the browser is using `@libs/Browser`. Use this as an absolute last resort and have the exception approved by several (ie. more than one) internal engineers.

## Type-checking web and native
`npm run typecheck` checks the app twice, because each platform loads different files and has different globals:
- `tsconfig.app.web.json` resolves `.web` files first and includes the DOM lib.
- `tsconfig.app.native.json` resolves `.ios`, `.android` and `.native` files first, and has no DOM lib, so `document`, `window.location` and the rest of the browser API are type errors in native code.

Both include all of `src`, so a shared file is checked once as web and once as native. A file with a `.native` sibling is still checked as native code too, until it's renamed `.web`, which takes it out of the native program.

### - Platform-specific modules MUST share a contract
Callers import `./foo`, and each platform resolves it to a different file, so nothing else checks that `foo.native.ts` exports what `foo.ts` does. Define the shared types in a `types.ts` next to the platform files and type each implementation with them, as described in [STYLE.md](../STYLE.md).

### - Native globals MUST match what React Native provides
React Native provides some web APIs as globals without typing them, like `performance.now()`, `queueMicrotask`, `requestIdleCallback`, `atob` / `btoa` and `TextEncoder` / `TextDecoder`. They're declared in `src/types/native/globals.d.ts`. Only add a global there once you've confirmed it exists on iOS and Android, and only declare the parts the App uses. On native, `window` is the global object itself, with no `document`, and `navigator` is just `{product: 'ReactNative'}`.

### Native typecheck baseline
The native program still has known errors, so instead of a hard gate at 0 it's compared with a per-file baseline, `config/typescript/native-baseline.tsv`. Every other project must have no errors.

- A file that isn't in the baseline, or has more errors than the baseline records, fails `npm run typecheck`. Only the errors in those files are printed.
- Fewer errors pass. CI rewrites the baseline lower, and on `main` the typecheck workflow commits it back, the same way the [lint seatbelt](../LINTING.md#seatbelt) is tightened. Locally the file isn't touched.
- When you move or rename a file that already has errors, its errors show up under a new path. Run `TYPECHECK_BASELINE_UPDATE=1 npm run typecheck` and commit the updated baseline with your change.
- Line numbers and error codes are ignored on purpose: fixing one error can uncover another in the same file, and the count per file is what matters.
- The typecheck also fails if the native program ever loads the DOM lib, which a dependency can do with `/// <reference lib="dom" />`. It names the file that pulled it in.

### Linting and tests
- Type-aware lint picks the first project in the root `tsconfig.json` that includes a file. Shared files are linted with the web types, and `.native`, `.ios` and `.android` files with the native types.
- Jest runs tests as iOS, but its typecheck extends the web project, so a test of native-only code can see a library's web typings. Point the test at the library's native typings, or cast with a comment explaining why.

### Dependency bumps
Many libraries ship separate `.web.d.ts` typings, and the web program checks against them, so a bump can surface web type errors even when nothing changed for native. When it does, patch the typings in the bump PR and open the fix upstream at the same time, then drop the patch once it's released.
