module.exports = {
    testRunner: 'jest',
    runnerConfig: 'tests/e2e/config.json',
    configurations: {
        'ios.sim.debug': {
            binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/expensify.cash.app',
            build: 'xcodebuild -workspace ios/ExpensifyCash.xcworkspace -scheme ExpensifyCash -configuration '
                + 'Debug -sdk iphonesimulator -derivedDataPath ios/build | xcpretty',
            type: 'ios.simulator',
            name: 'iPhone 11'
        },
        'ios.sim.release': {
            binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/expensify.cash.app',
            build: 'xcodebuild -workspace ios/ExpensifyCash.xcworkspace -scheme ExpensifyCash -configuration '
                + 'Release -sdk iphonesimulator -derivedDataPath ios/build | xcpretty',
            type: 'ios.simulator',
            name: 'iPhone 11'
        },
    },
};
