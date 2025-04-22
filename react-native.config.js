const isHybrid = process.env.IS_HYBRID_APP === 'true';
const projectRootPath = isHybrid ? './Mobile-Expensify/' : './';
const iosSourceDir = projectRootPath + (isHybrid ? 'iOS' : 'ios');
const androidSourceDir = projectRootPath + (isHybrid ? 'Android' : 'android');

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
