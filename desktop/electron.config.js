module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'Chat',
    afterSign: 'desktop/notarize.js',
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
    publish: [{
        provider: 's3',
        bucket: 'chat-test-expensify-com',
        channel: 'latest'
    }],
    files: [
        './dist/**/*',
        './main.js',
        './desktop/ELECTRON_EVENTS.js',
    ]
};
