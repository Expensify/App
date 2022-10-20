const path = require('path');
const {config} = require('./wdio.shared.conf');

config.capabilities = [
    {
        maxInstances: 1,
        platformName: 'Android',
        deviceName: 'Android Emulator',
        app: path.resolve(__dirname, './android/app/build/outputs/apk/debug/app-debug.apk'),
        appActivity: 'com.expensify.chat.MainActivity',
        appPackage: 'com.expensify.chat',
        automationName: 'UiAutomator2',
    },
];

exports.config = config;
