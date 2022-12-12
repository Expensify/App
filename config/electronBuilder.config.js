const {version} = require('../package.json');

const isPublishing = process.argv.includes('--publish');
const pullRequestNumber = process.env.PULL_REQUEST_NUMBER;

const s3Bucket = {
    production: 'expensify-cash',
    staging: 'staging-expensify-cash',
    internal: 'ad-hoc-expensify-cash',
};

const s3Path = {
    production: '/',
    staging: '/',
    internal: process.env.PULL_REQUEST_NUMBER
        ? `/desktop/${pullRequestNumber}/`
        : '/',
};

const macIcon = {
    production: './desktop/icon.png',
    staging: './desktop/icon-stg.png',
    internal: './desktop/icon-stg.png',
};

const isCorrectElectronEnv = ['production', 'staging', 'internal'].includes(
    process.env.ELECTRON_ENV,
);

if (!isCorrectElectronEnv) {
    throw new Error('Invalid ELECTRON_ENV!');
}

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
        icon: macIcon[process.env.ELECTRON_ENV],
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
            bucket: s3Bucket[process.env.ELECTRON_ENV],
            channel: 'latest',
            path: s3Path[process.env.ELECTRON_ENV],
        },
    ],
    afterSign: isPublishing ? './desktop/notarize.js' : undefined,
    files: ['dist', '!dist/www/{.well-known,favicon*}'],
    directories: {
        app: 'desktop',
        output: 'desktop-build',
    },
};
