const baseElectronBuilderConfig = require('./electronBuilder.local.config');

module.exports = {
    ...baseElectronBuilderConfig,
    publish: [{
        provider: 's3',
        bucket: process.env.ELECTRON_ENV === 'staging' ? 'staging-expensify-cash' : 'expensify-cash',
        channel: 'latest',
    }],
    afterSign: './desktop/notarize.js',
};
