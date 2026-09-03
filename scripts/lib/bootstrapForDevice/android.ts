import {isRecord, isUnknownArray} from '@src/types/utils/ObjectUtils';

import type {TupleToUnion} from 'type-fest';

import {resolve} from 'node:path';

import type {AndroidBootstrapOptions} from './shared';

import {readJSONFile, readTextFile, writeTextFile} from '../bunFile';
import {validateSuffix} from './shared';

const ANDROID_BUILD_TYPES = ['release', 'debug', 'adhoc', 'appTestFork'] as const;
const REGISTERED_ANDROID_APPLICATION_IDS = {
    release: 'org.me.mobiexpensifyg',
    debug: 'org.me.mobiexpensifyg.dev',
    adhoc: 'org.me.mobiexpensifyg.adhoc',
    appTestFork: 'org.me.mobiexpensifyg.appTestFork',
} as const;
const ANDROID_APPLICATION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/;

type AndroidBuildType = TupleToUnion<typeof ANDROID_BUILD_TYPES>;
type AndroidApplicationIDs = Record<AndroidBuildType, string>;

/** Rewrites Android package, Firebase, shortcut, manifest, and label settings for a side-by-side local installation. */
async function bootstrapAndroidForDevice(options: AndroidBootstrapOptions): Promise<void> {
    const androidDirectory = resolve(options.rootDirectory, 'Mobile-Expensify/Android');
    const suffix = validateSuffix(options.suffix);
    const androidSuffix = suffix ? normalizeAndroidIdentifierSegment(suffix) : undefined;
    const baseIdentifier = validateAndroidApplicationID(options.bundleIdentifier);
    const applicationIDs = androidApplicationIDs(baseIdentifier, androidSuffix);

    const buildGradlePath = resolve(androidDirectory, 'build.gradle');
    const buildGradle = await readTextFile(buildGradlePath);
    await writeTextFile(buildGradlePath, patchAndroidBuildGradle(buildGradle, applicationIDs.release));

    const googleServicesPath = resolve(androidDirectory, 'google-services.json');
    const googleServices = await readJSONFile(googleServicesPath);
    await writeTextFile(googleServicesPath, `${JSON.stringify(patchGoogleServicesConfig(googleServices, applicationIDs), null, 2)}\n`);

    const manifestPath = resolve(androidDirectory, 'AndroidManifest.xml');
    await writeTextFile(manifestPath, patchAndroidManifest(await readTextFile(manifestPath)));

    const shortcutsByBuildType = {
        release: 'res/xml-v25/shortcuts.xml',
        debug: 'build-types/debug/res/xml-v25/shortcuts.xml',
        adhoc: 'build-types/adhoc/res/xml-v25/shortcuts.xml',
    } as const;
    for (const buildType of ['release', 'debug', 'adhoc'] as const) {
        const relativePath = shortcutsByBuildType[buildType];
        const shortcutsPath = resolve(androidDirectory, relativePath);
        await writeTextFile(shortcutsPath, patchAndroidShortcutPackage(await readTextFile(shortcutsPath), applicationIDs[buildType]));
    }

    const suffixLabel = suffix ? ` (${suffix})` : '';
    const appNamesByBuildType = {
        release: {path: 'res/values/strings.xml', name: `Expensify${suffixLabel}`},
        debug: {path: 'build-types/debug/res/values/strings.xml', name: `Expensify Debug${suffixLabel}`},
        adhoc: {path: 'build-types/adhoc/res/values/strings.xml', name: `Expensify AdHoc${suffixLabel}`},
    } as const;
    for (const {path, name} of Object.values(appNamesByBuildType)) {
        const stringsPath = resolve(androidDirectory, path);
        await writeTextFile(stringsPath, patchAndroidAppName(await readTextFile(stringsPath), name));
    }

    console.log('Configured Mobile-Expensify for local Android release builds.');
    console.table(applicationIDs);
    console.warn(
        'Firebase resources are reused from the registered Expensify clients. Google Sign-In and other package/signature-restricted Google APIs will not work for synthetic application IDs.',
    );
}

/** Adds Firebase clients for missing local package variants by copying the corresponding registered build-type clients. */
function patchGoogleServicesConfig(config: unknown, applicationIDs: AndroidApplicationIDs): Record<string, unknown> {
    if (!isRecord(config) || !isUnknownArray(config.client)) {
        throw new Error('Mobile-Expensify/Android/google-services.json has an unexpected structure.');
    }
    const clients = [...config.client];
    for (const buildType of ANDROID_BUILD_TYPES) {
        const applicationID = applicationIDs[buildType];
        if (clients.some((client) => googleServicesClientPackage(client) === applicationID)) {
            continue;
        }
        const registeredApplicationID = REGISTERED_ANDROID_APPLICATION_IDS[buildType];
        const sourceClient = clients.find((client) => googleServicesClientPackage(client) === registeredApplicationID);
        if (!isRecord(sourceClient)) {
            throw new Error(`google-services.json does not contain the registered ${buildType} client ${registeredApplicationID}.`);
        }
        clients.push(cloneGoogleServicesClient(sourceClient, applicationID));
    }
    return {...config, client: clients};
}

/** Makes release-derived builds locally signable by changing the base application ID, using debug signing, and disabling release minification. */
function patchAndroidBuildGradle(buildGradle: string, baseIdentifier: string): string {
    const applicationIDPattern = /(defaultConfig\s*\{[\s\S]*?applicationId\s+)["'][^"']+["']/;
    if (!applicationIDPattern.test(buildGradle)) {
        throw new Error('Could not find defaultConfig.applicationId in Mobile-Expensify/Android/build.gradle.');
    }

    const buildWithApplicationID = buildGradle.replace(applicationIDPattern, `$1"${baseIdentifier}"`);
    const buildWithLocalSigning = buildWithApplicationID.replaceAll('signingConfig signingConfigs.release', 'signingConfig signingConfigs.debug');
    const buildWithoutMinification = buildWithLocalSigning.replace(/^(\s*)(?!\/\/)(minifyEnabled\s+true)$/m, '$1// $2');
    return buildWithoutMinification.replace(/^(\s*)(?!\/\/)(proguardFiles\s+.+)$/m, '$1// $2');
}

/** Points an Android shortcut resource at the package for its build type. */
function patchAndroidShortcutPackage(shortcuts: string, applicationID: string): string {
    return shortcuts.replaceAll(/android:targetPackage="[^"]+"/g, `android:targetPackage="${applicationID}"`);
}

/** Replaces the manifest's hard-coded shortcut package with Gradle's application-ID placeholder. */
function patchAndroidManifest(manifest: string): string {
    const applicationIDPlaceholder = ['$', '{applicationId}'].join('');
    return manifest.replace(/android:targetPackage="org\.me\.mobiexpensifyg"/, `android:targetPackage="${applicationIDPlaceholder}"`);
}

/** Replaces the Android app label while preserving the rest of the string resources. */
function patchAndroidAppName(strings: string, name: string): string {
    const appNamePattern = /<string name="app_name">[^<]+<\/string>/;
    if (!appNamePattern.test(strings)) {
        throw new Error('Could not find app_name in an Android strings.xml file.');
    }
    return strings.replace(appNamePattern, `<string name="app_name">${name}</string>`);
}

/** Derives the package names used by every Android build type from the local release identifier. */
function androidApplicationIDs(baseIdentifier: string, suffix?: string): AndroidApplicationIDs {
    const release = [baseIdentifier, suffix].filter(Boolean).join('.');
    return {
        release,
        debug: `${release}.dev`,
        adhoc: `${release}.adhoc`,
        appTestFork: `${release}.appTestFork`,
    };
}

/** Clones a registered Firebase client for a synthetic package and removes OAuth clients that cannot work with its unregistered package and certificate pair. */
function cloneGoogleServicesClient(client: Record<string, unknown>, applicationID: string): Record<string, unknown> {
    const cloned: unknown = structuredClone(client);
    if (!isRecord(cloned) || !isRecord(cloned.client_info) || !isRecord(cloned.client_info.android_client_info)) {
        throw new Error('google-services.json contains an invalid Android client.');
    }
    cloned.client_info.android_client_info.package_name = applicationID;
    // Android OAuth clients are restricted to the registered package and signing certificate. Retaining them would imply that Google Sign-In works for the synthetic application ID.
    cloned.oauth_client = [];
    return cloned;
}

function googleServicesClientPackage(client: unknown): string | undefined {
    if (!isRecord(client) || !isRecord(client.client_info) || !isRecord(client.client_info.android_client_info)) {
        return undefined;
    }
    const packageName = client.client_info.android_client_info.package_name;
    return typeof packageName === 'string' ? packageName : undefined;
}

/** Converts a GitHub-style name into a valid Java identifier segment, including names that begin with a digit. */
function normalizeAndroidIdentifierSegment(value: string): string {
    const normalized = value.replaceAll('-', '_');
    return /^\d/.test(normalized) ? `developer_${normalized}` : normalized;
}

function validateAndroidApplicationID(value: string): string {
    if (!ANDROID_APPLICATION_ID_PATTERN.test(value)) {
        throw new Error(`Android application ID must use dot-separated Java identifier segments. Received: ${value}`);
    }
    return value;
}

export {
    androidApplicationIDs,
    bootstrapAndroidForDevice,
    normalizeAndroidIdentifierSegment,
    patchAndroidAppName,
    patchAndroidBuildGradle,
    patchAndroidManifest,
    patchAndroidShortcutPackage,
    patchGoogleServicesConfig,
    validateAndroidApplicationID,
};
export type {AndroidApplicationIDs};
