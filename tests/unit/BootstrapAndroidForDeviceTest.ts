// cspell:ignore appinvite mobilesdk

import {isUnknownArray} from '@src/types/utils/ObjectUtils';

import {
    androidApplicationIDs,
    defaultBundleIdentifier,
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

    test('uses local debug signing and disables R8 for release builds', () => {
        const buildGradle = `
            defaultConfig {
                applicationId "org.me.mobiexpensifyg"
            }
            release {
                signingConfig signingConfigs.release
                minifyEnabled true
                proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            }`;

        const patched = patchAndroidBuildGradle(buildGradle, 'com.example.expensify.branch');
        expect(patched).toContain('applicationId "com.example.expensify.branch"');
        expect(patched).toContain('signingConfig signingConfigs.debug');
        expect(patched).toContain('// minifyEnabled true');
        expect(patched).toContain("// proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'");
        expect(patchAndroidBuildGradle(patched, 'com.example.expensify.branch')).toBe(patched);
    });

    test('adds synthetic Google Services clients while retaining registered Firebase resources', () => {
        const identifiers = androidApplicationIDs('com.example.expensify', 'branch');
        const patched = patchGoogleServicesConfig(googleServicesFixture, identifiers);
        const {client: clients} = patched;
        if (!isUnknownArray(clients)) {
            throw new Error('Expected patched Google Services clients.');
        }
        const syntheticRelease = clients.find((client) => JSON.stringify(client).includes(identifiers.release));

        expect(clients).toHaveLength(8);
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

    test('patches package-dependent Android resources', () => {
        expect(patchAndroidShortcutPackage('<shortcut android:targetPackage="org.me.mobiexpensifyg"/>', 'com.example.expensify')).toBe(
            '<shortcut android:targetPackage="com.example.expensify"/>',
        );
        expect(patchAndroidManifest('<instrumentation android:targetPackage="org.me.mobiexpensifyg" />')).toBe(`<instrumentation android:targetPackage="$${'{applicationId}'}" />`);
        expect(patchAndroidAppName('<string name="app_name">Expensify</string>', 'Expensify (branch)')).toBe('<string name="app_name">Expensify (branch)</string>');
    });
});
