const ENVIRONMENT = require('../../src/CONST/ENVIRONMENT');

const isStagingBuild = process.env.NODE_ENV === 'staging';

/**
 * The basic app configurations for the production and staging Electron builds,
 * without the pieces that require code signing, notarizing, and publishing.
 *
 * This has been separated from main electronBuilder.ghactions.config.js file to make it easier to run local production or staging builds.
 */
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
    files: [
        './dist/**/*',
        './desktop/*.js',
        './src/libs/checkForUpdates.js',
        './src/CONST/ENVIRONMENT.js',
    ],
};
