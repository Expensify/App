const isHybrid = process.env.IS_HYBRID_APP === 'true' ? true : false;

const config = {
    assets: ['./assets/fonts/native'],
    dependencies: {},
};

// We need to unlink the react-native-wallet package from the android standalone build
// to prevent the build from failing due to missing Google TapAndPay SDK
if (!isHybrid) {
    config.dependencies['@expensify/react-native-wallet'] = {
        platforms: {
            android: null,
        },
    };
}

module.exports = config;
