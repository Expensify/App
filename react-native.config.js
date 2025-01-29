const iosSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'ios' : 'ios';
const androidSourceDir = process.env.PROJECT_ROOT_PATH ? process.env.PROJECT_ROOT_PATH + 'android' : 'android';

module.exports = {
    commands: require('@callstack/repack/commands/rspack'),
    project: {
        ios: {sourceDir: iosSourceDir},
        android: {sourceDir: androidSourceDir},
    },
    assets: ['./assets/fonts/native'],
};
