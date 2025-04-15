const iosSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'ios' : 'ios';
const androidSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'android' : 'android';
const isStandalone = process.env.NEW_DOT_FLAG === 'true';
const isHybrid = !isStandalone && process.env.IS_HYBRID_APP_REPO == 'true' ? true : false;

const config = {
    project: {
        ios: {sourceDir: iosSourceDir},
        android: {sourceDir: androidSourceDir},
    },

    assets: ['./assets/fonts/native'],
    dependencies: {},
};

const fs = require('fs');
let data = `isHybridAppRepo: ${process.env.IS_HYBRID_APP_REPO} \n isStandalone: ${isStandalone} \n wynik: ${isHybrid}`;
fs.writeFileSync('/Users/zuzannafurtak/Desktop/DUPA.txt', data, 'utf8');

if (!isHybrid) {
    config.dependencies['@expensify/react-native-wallet'] = {
        platforms: {
            android: null,
        },
    };
}

module.exports = config;
