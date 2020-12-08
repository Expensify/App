module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'Chat',
    extraMetadata: {
        main: './desktop/main.js',
    },
    mac: {
        category: 'public.app-category.finance',
        icon: './android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png',
        hardenedRuntime: true,
        entitlements: 'desktop/entitlements.mac.plist',
        entitlementsInherit: 'desktop/entitlements.mac.plist',
        type: 'distribution'
    },
    dmg: {
        title: 'Chat',
        artifactName: 'Chat.dmg',
        internetEnabled: true
    },
    files: [
        './dist/**/*',
        './desktop/*.js',
        './src/libs/checkForUpdates.js',
    ],
};
