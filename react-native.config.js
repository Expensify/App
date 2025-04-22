const isHybrid = process.env.IS_HYBRID_APP === 'true';

module.exports = {
    project: {
        ios: {sourceDir: isHybrid ? './Mobile-Expensify/iOS' : './ios'},
        android: {sourceDir: isHybrid ? './Mobile-Expensify/Android' : './android'},
    },
    assets: ['./assets/fonts/native'],
    dependencies: {
        // We need to unlink the react-native-wallet package from the android build
        // because it's not supported yet and we want to prevent the build from failing
        // due to missing Google TapAndPay SDK
        '@expensify/react-native-wallet': {
            platforms: {
                android: null,
            },
        },
    },
};
