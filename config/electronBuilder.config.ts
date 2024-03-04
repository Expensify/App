const {version} = require('../package.json');

const pullRequestNumber = process.env.PULL_REQUEST_NUMBER;

const s3Bucket: Record<string, string> = {
    production: 'expensify-cash',
    staging: 'staging-expensify-cash',
    adhoc: 'ad-hoc-expensify-cash',
};

const s3Path: Record<string, string> = {
    production: '/',
    staging: '/',
    adhoc: process.env.PULL_REQUEST_NUMBER ? `/desktop/${pullRequestNumber}/` : '/',
};

const macIcon: Record<string, string> = {
    production: './desktop/icon.png',
    staging: './desktop/icon-stg.png',
    adhoc: './desktop/icon-adhoc.png',
};

const isCorrectElectronEnv: boolean = ['production', 'staging', 'adhoc'].includes(process.env.ELECTRON_ENV ?? '');

if (!isCorrectElectronEnv) {
    throw new Error('Invalid ELECTRON_ENV!');
}

/**
 * The configuration for the debug, production and staging Electron builds.
 */
module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'New Expensify',
    extraMetadata: {
        version,
    },
    mac: {
        category: 'public.app-category.finance',
        icon: process.env.ELECTRON_ENV ? macIcon[process.env.ELECTRON_ENV] : undefined,
        hardenedRuntime: true,
        entitlements: 'desktop/entitlements.mac.plist',
        entitlementsInherit: 'desktop/entitlements.mac.plist',
        type: 'distribution',
        notarize: {
            teamId: '368M544MTT',
        },
    },
    dmg: {
        title: 'New Expensify',
        artifactName: 'NewExpensify.dmg',
        internetEnabled: true,
    },
    publish: [
        {
            provider: 's3',
            bucket: process.env.ELECTRON_ENV ? s3Bucket[process.env.ELECTRON_ENV] : undefined,
            channel: 'latest',
            path: process.env.ELECTRON_ENV ? s3Path[process.env.ELECTRON_ENV] : undefined,
        },
    ],
    files: ['dist', '!dist/www/{.well-known,favicon*}'],
    directories: {
        app: 'desktop',
        output: 'desktop-build',
    },
    protocols: {
        name: 'New Expensify',
        schemes: ['new-expensify'],
    },
};
