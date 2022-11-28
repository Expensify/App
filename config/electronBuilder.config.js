const {version} = require('../package.json');

const isPublishing = process.argv.includes('--publish');

const s3Bucket = {
    production: 'expensify-cash',
    staging: 'staging-expensify-cash',
    internal: 'ad-hoc-expensify-cash',
};

const macIcon = {
    production: './desktop/icon.png',
    staging: './desktop/icon-stg.png',
    internal: './desktop/icon-stg.png',
};

const isCorrectElectronEnv = ['production', 'staging', 'internal'].includes(
    process.env.ELECTRON_ENV,
);

/**
 * The configuration for the production and staging Electron builds.
 * It can be used to create local builds of the same, by omitting the `--publish` flag
 */
module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'New Expensify',
    extraMetadata: {
        version,
    },
    mac: {
        category: 'public.app-category.finance',
        icon: isCorrectElectronEnv
            ? macIcon[process.env.ELECTRON_ENV]
            : './desktop/icon-stg.png',
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
    publish: [
        {
            provider: 's3',
            bucket: isCorrectElectronEnv
                ? s3Bucket[process.env.ELECTRON_ENV]
                : 'ad-hoc-expensify-cash',
            channel: 'latest',
        },
    ],
    afterSign: isPublishing ? './desktop/notarize.js' : undefined,
    files: ['dist', '!dist/www/{.well-known,favicon*}'],
    directories: {
        app: 'desktop',
        output: 'desktop-build',
    },
};
