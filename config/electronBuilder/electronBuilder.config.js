const baseElectronBuilderConfig = require('./electronBuilder.base.config');

module.exports = {
    ...baseElectronBuilderConfig,
    publish: [{
        provider: 's3',
        bucket: process.env.SHOULD_DEPLOY_PRODUCTION === 'true' ? 'expensify-cash' : 'staging-expensify-cash',
        channel: 'latest',
    }],
    afterSign: './desktop/notarize.js',
};
