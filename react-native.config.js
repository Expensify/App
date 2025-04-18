const projectRootPath = process.env.IS_HYBRID_APP === 'true' ? './Mobile-Expensify' : './';
const iosSourceDir = projectRootPath + 'ios';
const androidSourceDir = projectRootPath + 'android';

module.exports = {
    project: {
        ios: {sourceDir: iosSourceDir},
        android: {sourceDir: androidSourceDir},
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
