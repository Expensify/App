// cspell:ignore appinvite mobilesdk

import {describe, expect, test} from 'bun:test';

import {
    DEFAULT_PLATFORMS,
    androidApplicationIDs,
    defaultBundleIdentifier,
    parseBuildVariants,
    parsePlatforms,
    patchAndroidAppName,
    patchAndroidBuildGradle,
    patchAndroidManifest,
    patchAndroidShortcutPackage,
    patchGoogleServicesConfig,
    validateAndroidApplicationID,
} from '../../scripts/bootstrapForDevice';

/* eslint-disable @typescript-eslint/naming-convention */
const registeredClient = (packageName: string, appID: string) => ({
    client_info: {
        mobilesdk_app_id: appID,
        android_client_info: {package_name: packageName},
    },
    oauth_client: [
        {
            client_id: 'android-client.apps.googleusercontent.com',
            client_type: 1,
            android_info: {package_name: packageName, certificate_hash: 'certificate'},
        },
    ],
    api_key: [{current_key: 'api-key'}],
    services: {
        appinvite_service: {
            other_platform_oauth_client: [{client_id: 'web-client.apps.googleusercontent.com', client_type: 3}],
        },
    },
});

const googleServicesFixture = {
    project_info: {project_number: '123', project_id: 'example'},
    client: [
        registeredClient('org.me.mobiexpensifyg', 'release-app-id'),
        registeredClient('org.me.mobiexpensifyg.dev', 'debug-app-id'),
        registeredClient('org.me.mobiexpensifyg.adhoc', 'adhoc-app-id'),
        registeredClient('org.me.mobiexpensifyg.appTestFork', 'test-fork-app-id'),
    ],
};
/* eslint-enable @typescript-eslint/naming-convention */

describe('bootstrapAndroidForDevice', () => {
    test('selects both platforms by default and only the explicitly selected platform otherwise', () => {
        expect(DEFAULT_PLATFORMS).toEqual(['ios', 'android']);
        expect(parsePlatforms('android')).toEqual(['android']);
        expect(parsePlatforms('ios')).toEqual(['ios']);
        expect(() => parsePlatforms('web')).toThrow('Platform must be one of: ios, android');
    });

    test('creates the default Android application ID from a GitHub username', () => {
        expect(defaultBundleIdentifier('Example-Developer', 'android')).toBe('com.example_developer.expensify');
        expect(defaultBundleIdentifier('123Developer', 'android')).toBe('com.developer_123developer.expensify');
        expect(validateAndroidApplicationID('com.example_developer.expensify')).toBe('com.example_developer.expensify');
        expect(() => validateAndroidApplicationID('com.example-developer.expensify')).toThrow('dot-separated Java identifier segments');
    });

    test('derives side-by-side application IDs for every build type', () => {
        expect(androidApplicationIDs('com.example.expensify', 'branch')).toEqual({
            release: 'com.example.expensify.branch',
            debug: 'com.example.expensify.branch.dev',
            adhoc: 'com.example.expensify.branch.adhoc',
            appTestFork: 'com.example.expensify.branch.appTestFork',
        });
    });

    test('parses a deduplicated list of build variants', () => {
        expect(parseBuildVariants('release, debug,ad-hoc,release')).toEqual(['release', 'debug', 'adhoc']);
        expect(() => parseBuildVariants('release,profile')).toThrow('release, debug, adhoc');
        expect(() => parseBuildVariants('')).toThrow('release, debug, adhoc');
    });

    test('uses local debug signing and disables R8 for release builds', () => {
        const buildGradle = `
            defaultConfig {
                applicationId "org.me.mobiexpensifyg"
            }
            buildTypes {
                release {
                    signingConfig signingConfigs.release
                    minifyEnabled true
                    proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
                }
            }`;

        const patched = patchAndroidBuildGradle(buildGradle, 'com.example.expensify.branch');
        expect(patched).toContain('applicationId "com.example.expensify.branch"');
        expect(patched).toContain('signingConfig signingConfigs.debug');
        expect(patched).toContain('minifyEnabled false');
        expect(patched).toContain("// proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'");
        expect(patchAndroidBuildGradle(patched, 'com.example.expensify.branch')).toBe(patched);
    });

    test('only patches the selected release-derived Android build types', () => {
        const buildGradle = `
            defaultConfig {
                applicationId "org.me.mobiexpensifyg"
            }
            buildTypes {
                release {
                    signingConfig signingConfigs.release
                    minifyEnabled true
                }
                adhoc {
                    initWith release
                    applicationIdSuffix ".adhoc"
                }
            }`;

        const patched = patchAndroidBuildGradle(buildGradle, 'com.example.expensify.branch', ['adhoc']);
        expect(patched).toContain('applicationId "com.example.expensify.branch"');
        expect(patched).toContain('signingConfig signingConfigs.release');
        expect(patched).toContain('minifyEnabled true');
        expect(patched).toContain('initWith release\n                    minifyEnabled false\n                    signingConfig signingConfigs.debug');
    });

    test('adds a synthetic Google Services client for the release build by default', () => {
        const identifiers = androidApplicationIDs('com.example.expensify', 'branch');
        const patched = patchGoogleServicesConfig(googleServicesFixture, identifiers);
        const {client: clients} = patched;
        const syntheticRelease = clients.find((client) => JSON.stringify(client).includes(identifiers.release));

        expect(clients).toHaveLength(5);
        /* eslint-disable @typescript-eslint/naming-convention */
        const expectedClient = {
            client_info: {
                mobilesdk_app_id: 'release-app-id',
                android_client_info: {package_name: identifiers.release},
            },
            oauth_client: [],
            api_key: [{current_key: 'api-key'}],
        };
        /* eslint-enable @typescript-eslint/naming-convention */
        expect(syntheticRelease).toMatchObject(expectedClient);
        expect(patchGoogleServicesConfig(patched, identifiers)).toEqual(patched);
    });

    test('adds synthetic Google Services clients for every selected build variant', () => {
        const identifiers = androidApplicationIDs('com.example.expensify', 'branch');
        const patched = patchGoogleServicesConfig(googleServicesFixture, identifiers, ['release', 'debug', 'adhoc']);

        expect(patched.client).toHaveLength(7);
        expect(patched.client.some((client) => JSON.stringify(client).includes(identifiers.release))).toBe(true);
        expect(patched.client.some((client) => JSON.stringify(client).includes(identifiers.debug))).toBe(true);
        expect(patched.client.some((client) => JSON.stringify(client).includes(identifiers.adhoc))).toBe(true);
        expect(patched.client.some((client) => JSON.stringify(client).includes(`branch.appTestFork`))).toBe(false);
    });

    test('patches package-dependent Android resources', () => {
        expect(patchAndroidShortcutPackage('<shortcut android:targetPackage="org.me.mobiexpensifyg"/>', 'com.example.expensify')).toBe(
            '<shortcut android:targetPackage="com.example.expensify"/>',
        );
        expect(patchAndroidManifest('<instrumentation android:targetPackage="org.me.mobiexpensifyg" />')).toBe(`<instrumentation android:targetPackage="$${'{applicationId}'}" />`);
        expect(patchAndroidAppName('<string name="app_name">Expensify</string>', 'Expensify (branch)')).toBe('<string name="app_name">Expensify (branch)</string>');
    });
});
