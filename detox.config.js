module.exports = {
    testRunner: 'jest',
    runnerConfig: 'tests/e2e/config.json',
    configurations: {
        'ios.sim.debug': {
            binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Chat.app',
            build: 'xcodebuild -workspace ios/ReactNativeChat.xcworkspace -scheme ReactNativeChat -configuration '
                + 'Debug -sdk iphonesimulator -derivedDataPath ios/build | xcpretty',
            type: 'ios.simulator',
            name: 'iPhone 11'
        },
        'ios.sim.release': {
            binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/Chat.app',
            build: 'xcodebuild -workspace ios/ReactNativeChat.xcworkspace -scheme ReactNativeChat -configuration '
                + 'Release -sdk iphonesimulator -derivedDataPath ios/build | xcpretty',
            type: 'ios.simulator',
            name: 'iPhone 11'
        },
    },
};
