"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var packageName = 'com.expensify.chat.dev';
var appPath = './android/app/build/intermediates/apk/development/debug/app-development-debug.apk';
var config = {
    MAIN_APP_PACKAGE: packageName,
    DELTA_APP_PACKAGE: packageName,
    BRANCH_MAIN: 'main',
    BRANCH_DELTA: 'main',
    MAIN_APP_PATH: appPath,
    DELTA_APP_PATH: appPath,
    RUNS: 8,
    BOOT_COOL_DOWN: 5 * 1000,
    FLAG: '-t',
};
exports.default = config;
