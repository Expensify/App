/** Patches selected legacy Android build variants with unique identifiers, Firebase settings, shortcuts, and labels. */

import {isJSONArray, isJSONObject} from '@src/types/utils/JSONUtils';

import type {JsonObject, JsonValue} from 'type-fest';

import {file, write} from 'bun';
import {resolve} from 'node:path';

import type {AndroidBootstrapOptions, BuildVariant, BuildVariants} from './shared';

import {DEFAULT_BUILD_VARIANTS, validateIdentifierSuffix} from './shared';

const REGISTERED_ANDROID_APPLICATION_IDS = {
    release: 'org.me.mobiexpensifyg',
    debug: 'org.me.mobiexpensifyg.dev',
    adhoc: 'org.me.mobiexpensifyg.adhoc',
    appTestFork: 'org.me.mobiexpensifyg.appTestFork',
} as const;
const ANDROID_APPLICATION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/;

type AndroidBuildType = BuildVariant | 'appTestFork';
type AndroidApplicationIDs = Record<AndroidBuildType, string>;
type GoogleServicesConfig = JsonObject & {client: JsonValue[]};
type GoogleServicesAndroidClientInfo = JsonObject & Record<'package_name', string>;
type GoogleServicesClientInfo = JsonObject & Record<'android_client_info', GoogleServicesAndroidClientInfo>;
type GoogleServicesClient = JsonObject & Record<'client_info', GoogleServicesClientInfo>;

/** Rewrites Android package, Firebase, shortcut, manifest, and label settings for a side-by-side local installation. */
async function bootstrapAndroidForDevice(options: AndroidBootstrapOptions): Promise<void> {
    const androidDirectory = resolve(options.rootDirectory, 'Mobile-Expensify/Android');
    const buildVariants = options.buildVariants ?? DEFAULT_BUILD_VARIANTS;
    const identifierSuffix = validateIdentifierSuffix(options.identifierSuffix);
    const androidIdentifierSuffix = identifierSuffix ? normalizeAndroidIdentifierSegment(identifierSuffix) : undefined;
    const baseIdentifier = validateAndroidApplicationID(options.bundleIdentifier);
    const applicationIDs = androidApplicationIDs(baseIdentifier, androidIdentifierSuffix);

    const buildGradlePath = resolve(androidDirectory, 'build.gradle');
    const buildGradle = await file(buildGradlePath).text();
    await write(buildGradlePath, patchAndroidBuildGradle(buildGradle, applicationIDs.release, buildVariants));

    const googleServicesPath = resolve(androidDirectory, 'google-services.json');
    // Bun exposes parsed JSON without a generic return type; successful parsing can only produce a JsonValue.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const googleServices = (await file(googleServicesPath).json()) as JsonValue;
    await write(googleServicesPath, `${JSON.stringify(patchGoogleServicesConfig(googleServices, applicationIDs, buildVariants), null, 2)}\n`);

    const manifestPath = resolve(androidDirectory, 'AndroidManifest.xml');
    await write(manifestPath, patchAndroidManifest(await file(manifestPath).text()));

    const shortcutsByBuildType = {
        release: 'res/xml-v25/shortcuts.xml',
        debug: 'build-types/debug/res/xml-v25/shortcuts.xml',
        adhoc: 'build-types/adhoc/res/xml-v25/shortcuts.xml',
    } as const;
    for (const buildType of buildVariants) {
        const relativePath = shortcutsByBuildType[buildType];
        const shortcutsPath = resolve(androidDirectory, relativePath);
        await write(shortcutsPath, patchAndroidShortcutPackage(await file(shortcutsPath).text(), applicationIDs[buildType]));
    }

    const identifierSuffixLabel = identifierSuffix ? ` (${identifierSuffix})` : '';
    const appNamesByBuildType = {
        release: {path: 'res/values/strings.xml', name: `Expensify${identifierSuffixLabel}`},
        debug: {path: 'build-types/debug/res/values/strings.xml', name: `Expensify Debug${identifierSuffixLabel}`},
        adhoc: {path: 'build-types/adhoc/res/values/strings.xml', name: `Expensify AdHoc${identifierSuffixLabel}`},
    } as const;
    for (const buildType of buildVariants) {
        const {path, name} = appNamesByBuildType[buildType];
        const stringsPath = resolve(androidDirectory, path);
        await write(stringsPath, patchAndroidAppName(await file(stringsPath).text(), name));
    }

    console.log(`Configured Mobile-Expensify Android build variants: ${buildVariants.join(', ')}.`);
    console.table(Object.fromEntries(buildVariants.map((buildVariant) => [buildVariant, applicationIDs[buildVariant]])));
    console.warn(
        'Firebase resources are reused from the registered Expensify clients. Google Sign-In and other package/signature-restricted Google APIs will not work for synthetic application IDs.',
    );
}

/** Adds Firebase clients for missing local package variants by copying the corresponding registered build-type clients. */
function patchGoogleServicesConfig(config: JsonValue, applicationIDs: AndroidApplicationIDs, buildVariants: BuildVariants = DEFAULT_BUILD_VARIANTS): GoogleServicesConfig {
    if (!isGoogleServicesConfig(config)) {
        throw new Error('Mobile-Expensify/Android/google-services.json has an unexpected structure.');
    }
    const clients = [...config.client];
    for (const buildType of buildVariants) {
        const applicationID = applicationIDs[buildType];
        if (clients.some((client) => googleServicesClientPackage(client) === applicationID)) {
            continue;
        }
        const registeredApplicationID = REGISTERED_ANDROID_APPLICATION_IDS[buildType];
        const sourceClient = clients.find((client) => googleServicesClientPackage(client) === registeredApplicationID);
        if (!sourceClient) {
            throw new Error(`google-services.json does not contain the registered ${buildType} client ${registeredApplicationID}.`);
        }
        clients.push(cloneGoogleServicesClient(sourceClient, applicationID));
    }
    return {...config, client: clients};
}

/** Changes the shared base application ID and makes the selected release-derived build types locally signable without minification. */
function patchAndroidBuildGradle(buildGradle: string, baseIdentifier: string, buildVariants: BuildVariants = DEFAULT_BUILD_VARIANTS): string {
    const applicationIDPattern = /(defaultConfig\s*\{[\s\S]*?applicationId\s+)["'][^"']+["']/;
    if (!applicationIDPattern.test(buildGradle)) {
        throw new Error('Could not find defaultConfig.applicationId in Mobile-Expensify/Android/build.gradle.');
    }

    let patched = buildGradle.replace(applicationIDPattern, `$1"${baseIdentifier}"`);
    for (const buildVariant of buildVariants) {
        patched = patchAndroidBuildType(patched, buildVariant);
    }
    return patched;
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
function androidApplicationIDs(baseIdentifier: string, identifierSuffix?: string): AndroidApplicationIDs {
    const release = [baseIdentifier, identifierSuffix].filter(Boolean).join('.');
    return {
        release,
        debug: `${release}.dev`,
        adhoc: `${release}.adhoc`,
        appTestFork: `${release}.appTestFork`,
    };
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

/** Applies local signing and minification overrides to one Android build type when it inherits release settings. */
function patchAndroidBuildType(buildGradle: string, buildVariant: BuildVariant): string {
    if (buildVariant === 'debug') {
        return buildGradle;
    }

    const blockPattern = new RegExp(`buildTypes\\s*\\{[\\s\\S]*?(^\\s*${buildVariant}\\s*\\{[\\s\\S]*?^\\s*\\})`, 'm');
    const block = buildGradle.match(blockPattern)?.at(1);
    if (!block) {
        throw new Error(`Could not find the ${buildVariant} build type in Mobile-Expensify/Android/build.gradle.`);
    }

    let patchedBlock = setGradleSetting(block, 'signingConfig', 'signingConfigs.debug');
    patchedBlock = setGradleSetting(patchedBlock, 'minifyEnabled', 'false');
    if (buildVariant === 'release') {
        patchedBlock = patchedBlock.replace(/^(\s*)(?!\/\/)(proguardFiles\s+.+)$/m, '$1// $2');
    }
    return buildGradle.replace(block, patchedBlock);
}

/** Replaces a Gradle build-type setting or adds it after the inherited build type so the override wins. */
function setGradleSetting(block: string, key: string, value: string): string {
    const settingPattern = new RegExp(`^(\\s*)${key}\\s+.*$`, 'm');
    if (settingPattern.test(block)) {
        return block.replace(settingPattern, `$1${key} ${value}`);
    }

    const inheritedBuildTypePattern = /^(\s*)initWith\s+\w+\s*$/m;
    if (inheritedBuildTypePattern.test(block)) {
        return block.replace(inheritedBuildTypePattern, `$&\n$1${key} ${value}`);
    }

    const openingPattern = /^(\s*)\w+\s*\{\s*$/m;
    if (!openingPattern.test(block)) {
        throw new Error(`Could not add ${key} to an Android build type.`);
    }
    return block.replace(openingPattern, `$&\n$1    ${key} ${value}`);
}

/** Clones a registered Firebase client for a synthetic package and removes OAuth clients that cannot work with its unregistered package and certificate pair. */
function cloneGoogleServicesClient(client: JsonValue, applicationID: string): GoogleServicesClient {
    if (!isGoogleServicesClient(client)) {
        throw new Error('google-services.json contains an invalid Android client.');
    }
    const cloned = structuredClone(client);
    cloned.client_info.android_client_info.package_name = applicationID;
    // Android OAuth clients are restricted to the registered package and signing certificate. Retaining them would imply that Google Sign-In works for the synthetic application ID.
    cloned.oauth_client = [];
    return cloned;
}

function googleServicesClientPackage(client: JsonValue): string | undefined {
    return isGoogleServicesClient(client) ? client.client_info.android_client_info.package_name : undefined;
}

function isGoogleServicesConfig(value: JsonValue): value is GoogleServicesConfig {
    return isJSONObject(value) && isJSONArray(value.client);
}

function isGoogleServicesClient(value: JsonValue): value is GoogleServicesClient {
    return (
        isJSONObject(value) &&
        isJSONObject(value.client_info) &&
        isJSONObject(value.client_info.android_client_info) &&
        typeof value.client_info.android_client_info.package_name === 'string'
    );
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
