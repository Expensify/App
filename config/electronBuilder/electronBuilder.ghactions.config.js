const baseElectronBuilderConfig = require('./electronBuilder.local.config');

const isStagingBuild = process.env.NODE_ENV === 'staging';

module.exports = {
    ...baseElectronBuilderConfig,
    publish: [{
        provider: 's3',
        bucket: isStagingBuild ? 'staging-expensify-cash' : 'expensify-cash',
        channel: 'latest',
    }],
    afterSign: './desktop/notarize.js',
};
