module.exports = {
    project: {
        ios: {sourceDir: 'ios'},
        android: {
            manifestPath: 'app/src/main/AndroidManifest.xml',
        },
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
