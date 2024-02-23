const packageName = 'com.expensify.chat.dev';
const appPath = './android/app/build/outputs/apk/development/debug/app-development-debug.apk';

export default {
    MAIN_APP_PACKAGE: packageName,
    DELTA_APP_PACKAGE: packageName,
    MAIN_APP_PATH: appPath,
    DELTA_APP_PATH: appPath,
    RUNS: 8,
    BOOT_COOL_DOWN: 5 * 1000,
};
