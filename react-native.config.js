const {execSync} = require('child_process');
const iosSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'ios' : 'ios';
const androidSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'android' : 'android';

const config = {
    project: {
        ios: {sourceDir: iosSourceDir},
        android: {sourceDir: androidSourceDir},
    },
};

try {
    const stdout = execSync('scripts/is-really-hybrid.sh').toString().trim();

    if (stdout === 'false') {
        config.dependencies['@expensify/react-native-wallet'] = {
            platforms: {
                android: null,
            },
        };
    }
} catch (error) {
    console.error(`react-native config error: ${error}`);
}

module.exports = config;
