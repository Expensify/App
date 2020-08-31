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
    files: [
        './dist/**/*',
        './main.js'
    ]
};
