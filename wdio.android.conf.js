const {config} = require('./wdio.shared.conf');

config.capabilities = [
    {
        maxInstances: 1,
    },
];

exports.config = config;
