const ENVIRONMENT = require('../src/CONST/ENVIRONMENT');

module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'New Expensify',
    extraMetadata: {
        main: './desktop/main.js',
        electronEnvironment: process.env.SHOULD_DEPLOY_PRODUCTION ? ENVIRONMENT.PRODUCTION : ENVIRONMENT.STAGING,
    },
    mac: {
        category: 'public.app-category.finance',
        icon: process.env.SHOULD_DEPLOY_PRODUCTION === 'true' ? './desktop/icon.png' : './desktop/icon-stg.png',
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
        bucket: process.env.SHOULD_DEPLOY_PRODUCTION === 'true' ? 'expensify-cash' : 'staging-expensify-cash',
        channel: 'latest',
    }],
    files: [
        './dist/**/*',
        './desktop/*.js',
        './src/libs/checkForUpdates.js',
        './src/CONST/ENVIRONMENT.js',
    ],
};
