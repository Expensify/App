# HybridApp Philosophy
This describes how the HybridApp architecture works and the conventions that MUST be followed when working with it.

#### Terminology
- **HybridApp** - The production app containing both "Expensify Classic" and "New Expensify"
- **NewDot** - The new Expensify application (this repository)
- **Mobile-Expensify** - Git submodule containing Expensify Classic code
- **Standalone** - NewDot running independently without Classic integration

## Overview

Currently, the production Expensify app contains both "Expensify Classic" and "New Expensify". The file structure is as follows:

- 📂 [**App**](https://github.com/Expensify/App)
    - 📂 [**android**](https://github.com/Expensify/App/tree/main/android): New Expensify Android specific code (not a part of HybridApp native code)
    - 📂 [**ios**](https://github.com/Expensify/App/tree/main/ios): New Expensify iOS specific code (not a part of HybridApp native code)
    - 📂 [**src**](https://github.com/Expensify/App/tree/main/src): New Expensify TypeScript logic
    - 📂 [**Mobile-Expensify**](https://github.com/Expensify/Mobile-Expensify): `git` submodule that is pointed to [Mobile-Expensify](https://github.com/Expensify/Mobile-Expensify)
        - 📂 [**Android**](https://github.com/Expensify/Mobile-Expensify/tree/main/Android): Expensify Classic Android specific code
        - 📂 [**iOS**](https://github.com/Expensify/Mobile-Expensify/tree/main/iOS): Expensify Classic iOS specific code
        - 📂 [**app**](https://github.com/Expensify/Mobile-Expensify/tree/main/app): Expensify Classic JavaScript logic (aka YAPL)

You can only build HybridApp if you have been granted access to [`Mobile-Expensify`](https://github.com/Expensify/Mobile-Expensify). For most contributors, you will be working on the standalone NewDot application.

## Rules

### - Access to Mobile-Expensify repository is REQUIRED to build HybridApp
For most contributors, you SHOULD work on the standalone NewDot application instead.

### - Git submodule MUST be properly initialized and configured
When working with HybridApp:

1. Initialize the submodule: `git submodule init`
2. Update the submodule: `git submodule update`
3. Configure automatic updates: `git config --global submodule.recurse true`

### - HybridApp native code MUST be accessed through Mobile-Expensify directories
The native code for HybridApp is located in:
- `./Mobile-Expensify/Android` (not `./android`)
- `./Mobile-Expensify/iOS` (not `./ios`)

Changes to `./android` and `./ios` folders at the root **will NOT affect HybridApp builds**.

### - IDEs MUST open the correct workspace for HybridApp development
To open HybridApp projects:
- **Android Studio**: `./Mobile-Expensify/Android`
- **Xcode**: `./Mobile-Expensify/iOS/Expensify.xcworkspace`

### - Scripts automatically target HybridApp when Mobile-Expensify is present
Default npm scripts target HybridApp when the submodule exists:

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `npm run android`     | Build **HybridApp** for Android    |
| `npm run ios`         | Build **HybridApp** for iOS        |
| `npm run ipad`        | Build **HybridApp** for iPad       |
| `npm run ipad-sm`     | Build **HybridApp** for small iPad |
| `npm run pod-install` | Install pods for **HybridApp**     |
| `npm run clean`       | Clean native code of **HybridApp** |

### - Standalone scripts MUST be used when targeting NewDot only
Append `-standalone` to target standalone NewDot:

| Command                          | Description                                                 |
| -------------------------------- | ----------------------------------------------------------- |
| `npm run install-standalone`     | Install standalone **NewDot** node modules (`npm install`) |
| `npm run clean-standalone`       | Clean native code for standalone **NewDot**                |
| `npm run android-standalone`     | Build **NewDot** for Android in standalone mode            |
| `npm run ios-standalone`         | Build **NewDot** for iOS in standalone mode                |
| `npm run pod-install-standalone` | Install pods for standalone **NewDot**                     |
| `npm run ipad-standalone`        | Build **NewDot** for iPad in standalone mode               |
| `npm run ipad-sm-standalone`     | Build **NewDot** for small iPad in standalone mode         |

## Setup Instructions

### Initial Setup
1. Follow [NewDot setup instructions](https://github.com/Expensify/App?tab=readme-ov-file#getting-started) first
2. Initialize submodule: `git submodule init`
3. Update submodule: `git submodule update`
   - For faster setup: `git submodule update --init --progress --depth 100`
4. Configure Git for automatic submodule updates: `git config --global submodule.recurse true`

### Git Configuration
If you have access to `Mobile-Expensify` and commands fail, add to `~/.gitconfig`:

```
[url "https://github.com/"]
    insteadOf = ssh://git@github.com/
```

To prevent submodule changes from appearing in `git status`, add to `.git/config`:

```
[submodule "Mobile-Expensify"]
    ignore = all
```

### External Contributors and C+ Contributors
If you need to modify `Mobile-Expensify` source code:

1. Create your own fork of Mobile-Expensify
2. Swap the origin: `cd Mobile-Expensify && git remote set-url origin <YOUR_FORK_URL>`

## Submodule Management

### - Submodule updates SHOULD be done carefully
The `Mobile-Expensify` directory points to a specific commit. To update:

- Download latest changes: `git submodule update --remote`
- Manual update: Switch branches and pull within the `Mobile-Expensify` directory

### - Submodule state MUST be considered when switching branches
When switching branches, run `git submodule update` to ensure compatibility.

## HybridApp-Specific Features

### Patches
- Patches are applied automatically during `npm install`
- Add HybridApp-specific patches: `npx patch-package <PACKAGE_NAME> --patch-dir Mobile-Expensify/patches`

### Additional Resources
For extended documentation, troubleshooting, and pro tips, refer to the platform specific guides:

* **📱 iOS Development**: [iOS Setup Instructions](contributingGuides/SETUP_IOS.md)  
* **🤖 Android Development**: [Android Setup Instructions](contributingGuides/SETUP_ANDROID.md)
