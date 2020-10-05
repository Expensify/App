module.exports = {
    testRunner: 'jest',
    runnerConfig: 'e2e/config.json',
    configurations: {
        'ios.sim.debug': {
            binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Chat.app',
            build: 'xcodebuild -workspace ios/ReactNativeChat.xcworkspace -scheme ReactNativeChat -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -destination "platform=iOS Simulator,name=iPhone 11,OS=13.7" | xcpretty',
            type: 'ios.simulator',
            device: {
                type: 'iPhone 11'
            }
        },
        'ios.sim.release': {
            binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/Chat.app',
            build: 'xcodebuild -workspace ios/ReactNativeChat.xcworkspace -scheme ReactNativeChat -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -destination "platform=iOS Simulator,name=iPhone 11,OS=13.7" | xcpretty',
            type: 'ios.simulator',
            device: {
                type: 'iPhone 11'
            }
        }
    }
};
