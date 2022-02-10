const ENVIRONMENT = require('../../src/CONST/ENVIRONMENT');

/**
 * The basic app configurations for the production and staging Electron builds,
 * without the pieces that require code signing, notarizing, and publishing.
 *
 * This has been separated from main electronBuilder.config.js file to make it easier to run local production or staging builds.
 */
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
    files: [
        './dist/**/*',
        './desktop/*.js',
        './src/libs/checkForUpdates.js',
    ],
};
