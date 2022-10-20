exports.config = {
    maxInstances: 1,
    path: '/wd/hub',
    port: 4723,
    logLevel: 'info',
    depreciationWarnings: true,
    bail: 0,
    waitForTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    specs: ['./tests/e2e/tests/**/*.js'],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        requireModule: ['@babel/register'],
        ui: 'bdd',
        timeout: 60000,
    },
};
