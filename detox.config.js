module.exports = {
    configurations: {
        'ios.sim.debug': {
            binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/ReactNativeChat.app',
            build: 'xcodebuild -project ios/ReactNativeChat.xcodeproj -scheme ReactNativeChat -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
            type: 'ios.simulator',
            device: {
                type: 'iPhone 11'
            }
        }
    }
};
