const {exec} = require('child_process');

const iosSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'ios' : 'ios';
const androidSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'android' : 'android';

// Define your configuration object
const config = {
    project: {
        ios: {sourceDir: iosSourceDir},
        android: {sourceDir: androidSourceDir},
    },
    assets: ['./assets/fonts/native'],
    dependencies: {},
};

exec(`scripts/is-hybrid-app.sh`, (error, stdout, stderr) => {
    if (error || stderr) {
        console.error('react-native.config.js', stderr);
        return;
    }

    if (stdout.trim() === 'false') {
        config.dependencies['@expensify/react-native-wallet'] = {
            platforms: {
                android: null,
            },
        };
    }

    module.exports = config;
});
