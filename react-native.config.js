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

    // @appduct/react-native links its pod only into an Xcode configuration named `Debug`. Standalone builds use
    // DebugDevelopment (scripts/run-build.sh), so list every debug configuration in ./ios.
    config.dependencies['@appduct/react-native'] = {
        platforms: {
            ios: {configurations: ['Debug', 'DebugDevelopment', 'DebugAdHoc', 'DebugProduction']},
        },
    };
}

module.exports = config;
