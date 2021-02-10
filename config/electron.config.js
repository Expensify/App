module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'Expensify.cash',
    extraMetadata: {
        main: './desktop/main.js',
    },
    afterSign: 'desktop/notarize.js',
    mac: {
        category: 'public.app-category.finance',
        icon: './desktop/icon.png',
        hardenedRuntime: true,
        entitlements: 'desktop/entitlements.mac.plist',
        entitlementsInherit: 'desktop/entitlements.mac.plist',
        type: 'distribution',
    },
    dmg: {
        title: 'Expensify.cash',
        artifactName: 'Expensify.cash.dmg',
        internetEnabled: true,
    },
    publish: [{
        provider: 's3',
        bucket: 'chat-test-expensify-com',
        channel: 'latest',
    }],
    files: [
        './dist/**/*',
        './desktop/*.js',
        './src/libs/checkForUpdates.js',
    ],
};
