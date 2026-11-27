const isHybrid = process.env.IS_HYBRID_APP === 'true' ? true : false;

const config = {
    assets: ['./assets/fonts/native'],
    // Lets knip see that these are used: react-native-clean-project is a React Native CLI plugin found by the CLI, and expo-font is linked natively.
    // The Entrust step packages are linked natively too: they add the native welcome, document and device-security modules that @entrust.corporation/idvsdk-reactnative runs.
    /** @type {import('react-native-clean-project')} */
    /** @import {} from 'expo-font' */
    /** @import {} from '@entrust.corporation/idvsdk-reactnative-welcome' */
    /** @import {} from '@entrust.corporation/idvsdk-reactnative-document' */
    /** @import {} from '@entrust.corporation/idvsdk-reactnative-device-security' */
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
