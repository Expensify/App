module.exports = {
    project: {
        ios: {sourceDir: '../iOS'},
        android: {sourceDir: '../Android'},
    },
    assets: ['./assets/fonts/native'],
    dependencies: {
        'react-native-flipper': {
            platforms: {
                ios: null
            }
        }
    }
};
