const {version} = require('../../package.json');

const isStaging = process.env.ELECTRON_ENV === 'staging';
const isPublishing = process.argv.includes('--publish');

/**
 * The configuration for the production and staging Electron builds.
 * It can be used to create local builds of the same, by omitting the `--publish` flag
 */
module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'New Expensify',
    extraMetadata: {
        version,
        electronEnvironment: process.env.ELECTRON_ENV || 'development',
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
    publish: [{
        provider: 's3',
        bucket: isStaging ? 'staging-expensify-cash' : 'expensify-cash',
        channel: 'latest',
    }],
    afterSign: isPublishing ? './desktop/notarize.js' : undefined,
    files: [
        'dist',
        '!dist/www/{.well-known,favicon*}',
    ],
    directories: {
        app: 'desktop',
        output: 'desktop-build',
    },
};
