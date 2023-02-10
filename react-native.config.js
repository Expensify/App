module.exports = {
    project: {
        ios: {sourceDir: 'ios'},
        android: {},
    },
    dependencies: {
        'react-native-flipper': {
            platforms: {
                ios: null,
            },
        },
    },
    assets: ['./assets/fonts/native'],
};
