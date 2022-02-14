const ENVIRONMENT = require('../../src/CONST/ENVIRONMENT');
const {version} = require('../../package.json');

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
        version,
        electronEnvironment: isStaging ? ENVIRONMENT.STAGING : ENVIRONMENT.PRODUCTION,
    },
    mac: {
        category: 'public.app-category.finance',
        target: [
            {target: 'dmg', arch: ['x64', 'arm64', 'universal']},
        ],
        icon: isStaging ? './desktop/icon-stg.png' : './desktop/icon.png',
        hardenedRuntime: true,
        entitlements: 'desktop/entitlements.mac.plist',
        entitlementsInherit: 'desktop/entitlements.mac.plist',
        type: 'distribution',
    },
    dmg: {
        internetEnabled: true,
    },
    files: [
        'dist',
        '!dist/www/{.well-known,favicon*}',
    ],
    directories: {
        app: 'desktop',
        output: 'desktop-build',
    },
};
