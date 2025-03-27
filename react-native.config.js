const iosSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'ios' : 'ios';
const androidSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'android' : 'android';
const linkAssets = require('@react-native-community/cli-link-assets');

module.exports = {
    project: {
        ios: {sourceDir: iosSourceDir},
        android: {sourceDir: androidSourceDir},
    },
    assets: ['./assets/fonts/native'],
    commands: [linkAssets.commands.linkAssets]
};
