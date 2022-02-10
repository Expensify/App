const ENVIRONMENT = require('../src/CONST/ENVIRONMENT');

const isStagingBuild = process.env.NODE_ENV === 'staging';

module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'New Expensify',
    extraMetadata: {
        main: './desktop/main.js',
        electronEnvironment: isStagingBuild ? ENVIRONMENT.STAGING : ENVIRONMENT.PRODUCTION,
    },
    mac: {
        category: 'public.app-category.finance',
        icon: isStagingBuild ? './desktop/icon-stg.png' : './desktop/icon.png',
        hardenedRuntime: true,
        entitlements: 'desktop/entitlements.mac.plist',
        entitlementsInherit: 'desktop/entitlements.mac.plist',
        type: 'distribution',
    },
    dmg: {
        title: 'New Expensify',
        artifactName: 'NewExpensify.dmg',
        internetEnabled: true,
    },
    publish: [{
        provider: 's3',
        bucket: isStagingBuild ? 'staging-expensify-cash' : 'expensify-cash',
        channel: 'latest',
    }],
    afterSign: './desktop/notarize.js',
    files: [
        './dist/**/*',
        './desktop/*.js',
        './src/libs/checkForUpdates.js',
    ],
};
