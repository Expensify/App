module.exports = {
    configurations: {
        'ios.sim.debug': {
            binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/ReactNativeChat.app',
            build: 'xcodebuild -workspace ios/ReactNativeChat.xcworkspace -scheme ReactNativeChat -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build | xcpretty',
            type: 'ios.simulator',
            device: {
                type: 'iPhone 11'
            }
        }
    }
};
