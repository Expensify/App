module.exports = {
    project: {
        ios: {sourceDir: process.env.PROJECT_ROOT_PATH + 'ios'},
        android: {
            sourceDir: process.env.PROJECT_ROOT_PATH + 'android',
            packageName: 'com.expensify.chat',
        },
    },
    assets: ['./assets/fonts/native'],
};
