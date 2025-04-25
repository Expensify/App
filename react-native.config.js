const iosSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'ios' : 'ios';
const androidSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'android' : 'android';
const isHybrid = process.env.IS_HYBRID_APP === 'true' ? true : false;

const config = {
    project: {
        ios: {sourceDir: iosSourceDir},
        android: {sourceDir: androidSourceDir},
    },
    assets: ['./assets/fonts/native'],
    dependencies: {},
};

if (!isHybrid) {
    config.dependencies['@expensify/react-native-wallet'] = {
        platforms: {
            android: null,
        },
    };
}

module.exports = config;
