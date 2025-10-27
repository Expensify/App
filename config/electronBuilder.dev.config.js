const {version} = require('../package.json');

/**
 * Electron Builder configuration for local development builds.
 * Based on working electron-secure-store-test implementation.
 */
module.exports = {
    appId: 'com.expensifyreactnative.chat.dev',
    productName: 'New Expensify Dev',
    extraMetadata: {
        version,
    },
    asarUnpack: ['**/node-mac-permissions/bin/**', '**/secure-store/build/**'],
    mac: {
        category: 'public.app-category.finance',
        icon: './desktop/icon-dev.png',
        // Use ad-hoc signing for local dev builds
        // identity: null,
        hardenedRuntime: true,
        gatekeeperAssess: true,
        entitlements: './desktop/entitlements.dev.mac.plist',
        entitlementsInherit: './desktop/entitlements.dev.mac.plist',
        // Build only for current architecture as dir (faster, no signing needed)
        target: [
            {
                target: 'dir',
                arch: ['arm64'],
            },
        ],
        extendInfo: {
            CFBundleIconName: 'AppIcon-dev',
            NSLocationWhenInUseUsageDescription: 'This app uses location to help you track distance expenses.',
            NSLocationUsageDescription: 'This app uses location to help you track distance expenses.',
            NSFaceIDUsageDescription: 'This app uses Face ID or Touch ID to securely access your stored secrets.',
        },
    },
    // No DMG for dev builds
    dmg: false,
    // No publishing for dev builds - local only
    publish: null,
    files: ['dist', '!dist/www/{.well-known,favicon*}', 'secure-store/build/Release/**/*', '!secure-store/build/Release/.deps', '!secure-store/build/Release/obj.target', 'icon-dev.png'],
    // Copy native addon and icon to Resources folder for packaged app
    extraFiles: [
        {
            from: 'desktop/secure-store/build/Release/secure_store_addon.node',
            to: 'Resources/secure_store_addon.node',
        },
        {
            from: 'desktop/secure-store/build/Release/libSecureStore.a',
            to: 'Resources/libSecureStore.a',
        },
        {
            from: 'desktop/icon-dev.png',
            to: 'Resources/icon-dev.png',
        },
    ],
    directories: {
        app: 'desktop',
        // Output to separate dev directory
        output: 'desktop-build-dev',
    },
    protocols: {
        name: 'New Expensify Dev',
        schemes: ['new-expensify'],
    },
    // Use afterPack hook to add rpaths for Swift runtime
    afterPack: './config/afterPack.js',
};
