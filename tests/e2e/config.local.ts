type Config = Record<string, string | number>;

const config: Config = {
    MAIN_APP_PACKAGE: 'com.expensify.chat.e2e',
    DELTA_APP_PACKAGE: 'com.expensify.chat.e2edelta',
    MAIN_APP_PATH: './android/app/build/outputs/apk/e2e/release/app-e2e-release.apk',
    DELTA_APP_PATH: './android/app/build/outputs/apk/e2edelta/release/app-e2edelta-release.apk',
    BOOT_COOL_DOWN: 1 * 1000,
    RUNS: 8,
};

export default config;
export type {Config};
