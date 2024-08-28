import type {Config} from './config.local';

const packageName = 'com.expensify.chat.dev';
const appPath = './android/app/build/outputs/apk/development/debug/app-development-debug.apk';

const config: Config = {
    MAIN_APP_PACKAGE: packageName,
    DELTA_APP_PACKAGE: packageName,
    BRANCH_MAIN: 'main',
    BRANCH_DELTA: 'main',
    MAIN_APP_PATH: appPath,
    DELTA_APP_PATH: appPath,
    RUNS: 8,
    BOOT_COOL_DOWN: 5 * 1000,
};

export default config;
