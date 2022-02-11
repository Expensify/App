const ENVIRONMENT = require('../../src/CONST/ENVIRONMENT');

const isStaging = process.env.ELECTRON_ENV === 'staging';

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
        electronEnvironment: isStaging ? ENVIRONMENT.STAGING : ENVIRONMENT.PRODUCTION,
    },
    mac: {
        category: 'public.app-category.finance',
        icon: isStaging ? './desktop/icon-stg.png' : './desktop/icon.png',
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
        '../dist/**/*',
        '*.js',
        '../src/libs/checkForUpdates.js',
        '../src/CONST/ENVIRONMENT.js',
    ],
};
