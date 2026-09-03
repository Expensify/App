#!/usr/bin/env bun
// cspell:ignore apos noverify smime

import {isRecord, isUnknownArray} from '@libs/ObjectUtils';

import type {TupleToUnion} from 'type-fest';

import CLI from 'expensify-common/CLI';
import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {join, resolve} from 'node:path';
import process from 'node:process';
import {createInterface} from 'node:readline/promises';

import spawnSync from './lib/bunProcess';

const CONFIGURATIONS = ['Debug', 'Release', 'AdHoc'] as const;
const TARGETS = ['Expensify', 'SmartScanExtension', 'NotificationServiceExtension', 'LiveActivityExtension', 'ExpensifyTests'] as const;
const PLATFORMS = ['ios', 'android'] as const;
const ANDROID_BUILD_TYPES = ['release', 'debug', 'adhoc', 'appTestFork'] as const;
const REGISTERED_ANDROID_APPLICATION_IDS = {
    release: 'org.me.mobiexpensifyg',
    debug: 'org.me.mobiexpensifyg.dev',
    adhoc: 'org.me.mobiexpensifyg.adhoc',
    appTestFork: 'org.me.mobiexpensifyg.appTestFork',
} as const;
const BUNDLE_IDENTIFIER_PATTERN = /^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
const ANDROID_APPLICATION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/;
const TEAM_ID_PATTERN = /^[A-Z0-9]{10}$/;
const APP_GROUP_ENTITLEMENT_FILES = [
    'Expensify/Expensify.entitlements',
    'Expensify/ExpensifyRelease.entitlements',
    'LiveActivityExtensionAdHoc.entitlements',
    'LiveActivityExtensionDebug.entitlements',
    'LiveActivityExtensionRelease.entitlements',
    'NotificationServiceExtension/NotificationServiceExtension.entitlements',
    'SmartScanExtension/SmartScanExtension.entitlements',
] as const;

type Configuration = TupleToUnion<typeof CONFIGURATIONS>;
type Target = TupleToUnion<typeof TARGETS>;
type Platform = TupleToUnion<typeof PLATFORMS>;
type AndroidBuildType = TupleToUnion<typeof ANDROID_BUILD_TYPES>;
type AndroidApplicationIDs = Record<AndroidBuildType, string>;
type DevelopmentTeam = {
    id: string;
    name: string;
};
type BootstrapOptions = {
    rootDirectory: string;
    developmentTeam: string;
    bundleIdentifier: string;
    suffix?: string;
};
type AndroidBootstrapOptions = Omit<BootstrapOptions, 'developmentTeam'>;

function validateIdentifier(value: string, label: string): string {
    if (!BUNDLE_IDENTIFIER_PATTERN.test(value)) {
        throw new Error(`${label} must contain dot-separated letters, numbers, or hyphens. Received: ${value}`);
    }
    return value;
}

function validateSuffix(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    if (!/^[A-Za-z0-9-]+$/.test(value)) {
        throw new Error(`Bundle identifier suffix must contain only letters, numbers, or hyphens. Received: ${value}`);
    }
    return value;
}

function parsePlatform(value: string): Platform {
    const platform = PLATFORMS.find((candidate) => candidate === value);
    if (!platform) {
        throw new Error(`Platform must be one of: ${PLATFORMS.join(', ')}. Received: ${value}`);
    }
    return platform;
}

function decodeXml(value: string): string {
    return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'");
}

/** Extracts the signing team from a decoded provisioning profile, excluding malformed and expired profiles. */
function parseDevelopmentTeamFromProvisioningProfile(profile: string, now = new Date()): DevelopmentTeam | undefined {
    const teamID = profile.match(/<key>TeamIdentifier<\/key>\s*<array>\s*<string>([^<]+)<\/string>/)?.at(1);
    const teamName = profile.match(/<key>TeamName<\/key>\s*<string>([^<]+)<\/string>/)?.at(1);
    const expirationDate = profile.match(/<key>ExpirationDate<\/key>\s*<date>([^<]+)<\/date>/)?.at(1);
    if (!teamID || !teamName || !TEAM_ID_PATTERN.test(teamID) || (expirationDate && new Date(expirationDate) <= now)) {
        return undefined;
    }
    return {id: teamID, name: decodeXml(teamName)};
}

/** Decodes the CMS payload in a provisioning profile, returning undefined when OpenSSL cannot verify or read it. */
function decodeProvisioningProfile(path: string): string | undefined {
    const result = spawnSync(['openssl', 'smime', '-verify', '-inform', 'der', '-noverify', '-in', path], {stdin: 'ignore', stderr: 'ignore'});
    return result.success ? result.stdout.toString() : undefined;
}

/** Finds valid signing teams in Xcode's current and legacy provisioning-profile directories and deduplicates them by team ID. */
function installedDevelopmentTeams(): DevelopmentTeam[] {
    const profileDirectories = [join(homedir(), 'Library/Developer/Xcode/UserData/Provisioning Profiles'), join(homedir(), 'Library/MobileDevice/Provisioning Profiles')];
    const teams = new Map<string, DevelopmentTeam>();
    for (const directory of profileDirectories) {
        let profileNames: string[];
        try {
            profileNames = readdirSync(directory).filter((name) => name.endsWith('.mobileprovision'));
        } catch {
            continue;
        }
        for (const profileName of profileNames) {
            const profile = decodeProvisioningProfile(join(directory, profileName));
            const team = profile ? parseDevelopmentTeamFromProvisioningProfile(profile) : undefined;
            if (team) {
                teams.set(team.id, team);
            }
        }
    }
    return [...teams.values()].toSorted((left, right) => left.name.localeCompare(right.name));
}

async function promptForDevelopmentTeam(teams: DevelopmentTeam[]): Promise<string> {
    if (teams.length === 0) {
        throw new Error('No Apple development teams were found. Add your Apple ID in Xcode > Settings > Accounts and download or create a provisioning profile, or pass --development-team.');
    }

    console.log('Select an Apple development team:');
    for (const [index, team] of teams.entries()) {
        console.log(`  ${index + 1}. ${team.name} (${team.id})`);
    }
    const readline = createInterface({input: process.stdin, output: process.stdout});
    try {
        while (true) {
            const answer = await readline.question('Team: ');
            const selectedTeam = teams.at(Number(answer) - 1);
            if (selectedTeam && /^\d+$/.test(answer.trim())) {
                return selectedTeam.id;
            }
            console.log(`Enter a number from 1 to ${teams.length}.`);
        }
    } finally {
        readline.close();
    }
}

async function resolveDevelopmentTeam(developmentTeam: string | undefined, teams = installedDevelopmentTeams(), prompt = promptForDevelopmentTeam): Promise<string> {
    if (developmentTeam) {
        return developmentTeam;
    }
    return prompt(teams);
}

/** Resolves the lowercase login associated with the configured GitHub token for use in a unique application identifier. */
async function githubUsername(): Promise<string> {
    const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('Could not determine your GitHub username. Set GH_TOKEN or GITHUB_TOKEN, or pass --github-username/--bundle-identifier.');
    }

    try {
        const {default: GithubUtils} = await import('@github/libs/GithubUtils');
        GithubUtils.initOctokitWithToken(token);
        const {data: user} = await GithubUtils.octokit.users.getAuthenticated();
        return user.login.toLowerCase();
    } catch {
        throw new Error('Could not determine your GitHub username. Check GH_TOKEN or GITHUB_TOKEN, or pass --github-username/--bundle-identifier.');
    }
}

/** Builds the platform-specific application identifier used when no identifier is supplied explicitly. */
function defaultBundleIdentifier(username: string, platform: Platform = 'ios'): string {
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(normalizedUsername)) {
        throw new Error(`GitHub username cannot be used in a bundle identifier: ${username}`);
    }
    return platform === 'ios' ? `com.${normalizedUsername}.expensify.expensifylite` : `com.${normalizeAndroidIdentifierSegment(normalizedUsername)}.expensify`;
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

function googleServicesClientPackage(client: unknown): string | undefined {
    if (!isRecord(client) || !isRecord(client.client_info) || !isRecord(client.client_info.android_client_info)) {
        return undefined;
    }
    const packageName = client.client_info.android_client_info.package_name;
    return typeof packageName === 'string' ? packageName : undefined;
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

/** Composes a unique bundle identifier from the local suffix, build configuration, and native target. */
function targetBundleIdentifier(baseIdentifier: string, target: Target, configuration: Configuration, suffix?: string): string {
    const configurationSuffix = configuration === 'AdHoc' ? 'adhoc' : undefined;
    const targetSuffix = target === 'Expensify' ? undefined : target;
    return [baseIdentifier, suffix, configurationSuffix, targetSuffix].filter(Boolean).join('.');
}

/** Maps each native target and build configuration to its XCBuildConfiguration identifier in the Xcode project. */
function configurationIDsByTarget(project: string): Map<Target, Map<Configuration, string>> {
    const result = new Map<Target, Map<Configuration, string>>();
    for (const target of TARGETS) {
        const listPattern = new RegExp(`\\/\\* Build configuration list for PBXNativeTarget "${target}" \\*\\/ = \\{[\\s\\S]*?buildConfigurations = \\(\\s*([\\s\\S]*?)\\s*\\);`);
        const list = project.match(listPattern)?.at(1);
        if (!list) {
            throw new Error(`Could not find build configurations for the ${target} target.`);
        }
        const configurations = new Map<Configuration, string>();
        for (const configuration of CONFIGURATIONS) {
            const identifier = list.match(new RegExp(`([A-F0-9]{24}) \\/\\* ${configuration} \\*\\/`))?.at(1);
            if (identifier) {
                configurations.set(configuration, identifier);
            }
        }
        if (!configurations.has('Debug') || !configurations.has('Release')) {
            throw new Error(`The ${target} target must have both Debug and Release configurations.`);
        }
        result.set(target, configurations);
    }
    return result;
}

/** Replaces a build setting in an XCBuildConfiguration block or inserts it when absent. */
function setBuildSetting(block: string, key: string, value: string): string {
    const escapedKey = key.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^(\\s*)"?${escapedKey}"? = [^;]*;$`, 'gm');
    if (pattern.test(block)) {
        return block.replaceAll(pattern, (_line, indentation: string) => `${indentation}${key} = ${value};`);
    }
    return block.replace(/(\n\s*buildSettings = \{)/, `$1\n\t\t\t\t${key} = ${value};`);
}

/** Removes every quoted or unquoted occurrence of a build setting from an XCBuildConfiguration block. */
function removeBuildSetting(block: string, key: string): string {
    const escapedKey = key.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return block.replaceAll(new RegExp(`^\\s*"?${escapedKey}"? = [^;]*;\\n`, 'gm'), '');
}

/** Configures one Xcode build configuration for automatic local signing and its derived bundle identifier. */
function patchBuildConfiguration(project: string, identifier: string, bundleIdentifier: string, developmentTeam: string, releaseEntitlements: boolean): string {
    const blockPattern = new RegExp(`(^\\s*${identifier} \\/\\* [^*]+ \\*\\/ = \\{[\\s\\S]*?^\\s*\\};)`, 'm');
    const block = project.match(blockPattern)?.at(1);
    if (!block) {
        throw new Error(`Could not find build configuration ${identifier}.`);
    }

    let patched = block;
    for (const key of ['CODE_SIGN_IDENTITY[sdk=iphoneos*]', 'DEVELOPMENT_TEAM[sdk=iphoneos*]', 'PROVISIONING_PROFILE[sdk=iphoneos*]', 'PROVISIONING_PROFILE_SPECIFIER[sdk=iphoneos*]']) {
        patched = removeBuildSetting(patched, key);
    }
    patched = setBuildSetting(patched, 'CODE_SIGN_IDENTITY', '"Apple Development"');
    patched = setBuildSetting(patched, 'CODE_SIGN_STYLE', 'Automatic');
    patched = setBuildSetting(patched, 'DEVELOPMENT_TEAM', developmentTeam);
    patched = setBuildSetting(patched, 'PRODUCT_BUNDLE_IDENTIFIER', bundleIdentifier);
    patched = setBuildSetting(patched, 'PROVISIONING_PROFILE', '""');
    patched = setBuildSetting(patched, 'PROVISIONING_PROFILE_SPECIFIER', '""');
    if (releaseEntitlements) {
        patched = setBuildSetting(patched, 'CODE_SIGN_ENTITLEMENTS', 'Expensify/ExpensifyRelease.entitlements');
    }
    return project.replace(block, patched);
}

/** Applies automatic signing and unique bundle identifiers to every supported Xcode target and configuration. */
function patchProject(project: string, baseIdentifier: string, suffix: string | undefined, developmentTeam: string): string {
    const configurationsByTarget = configurationIDsByTarget(project);
    let patched = project.replaceAll('ProvisioningStyle = Manual;', 'ProvisioningStyle = Automatic;');

    for (const target of TARGETS) {
        const configurations = configurationsByTarget.get(target);
        if (!configurations) {
            throw new Error(`Could not find configurations for ${target}.`);
        }
        for (const [configuration, identifier] of configurations) {
            const bundleIdentifier = targetBundleIdentifier(baseIdentifier, target, configuration, suffix);
            patched = patchBuildConfiguration(patched, identifier, bundleIdentifier, developmentTeam, target === 'Expensify' && configuration === 'Release');
        }
    }
    return patched;
}

/** Creates the minimal entitlements plist shared by the locally signed app and its extensions. */
function entitlementContents(appGroup: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>${appGroup}</string>
\t</array>
</dict>
</plist>
`;
}

/** Adds the optional local suffix to the iOS display name so side-by-side installations remain distinguishable. */
function patchIOSAppDisplayName(infoPlist: string, suffix: string | undefined): string {
    const displayNamePattern = /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/;
    if (!displayNamePattern.test(infoPlist)) {
        throw new Error('Could not find CFBundleDisplayName in Mobile-Expensify/iOS/Expensify/Expensify-Info.plist.');
    }
    const suffixLabel = suffix ? ` (${suffix})` : '';
    return infoPlist.replace(displayNamePattern, `$1Expensify${suffixLabel}$2`);
}

/** Rewrites the native iOS project, display name, and app-group entitlements for local device signing. */
function bootstrapIOSForDevice(options: BootstrapOptions): void {
    const iosDirectory = resolve(options.rootDirectory, 'Mobile-Expensify/iOS');
    const projectPath = resolve(iosDirectory, 'Expensify.xcodeproj/project.pbxproj');
    const suffix = validateSuffix(options.suffix);
    const baseIdentifier = validateIdentifier(options.bundleIdentifier, 'Bundle identifier');
    if (!TEAM_ID_PATTERN.test(options.developmentTeam)) {
        throw new Error(`Apple development team must be a 10-character team ID. Received: ${options.developmentTeam}`);
    }

    const project = readFileSync(projectPath, 'utf8');
    const patchedProject = patchProject(project, baseIdentifier, suffix, options.developmentTeam);
    writeFileSync(projectPath, patchedProject);

    const infoPlistPath = resolve(iosDirectory, 'Expensify/Expensify-Info.plist');
    const infoPlist = readFileSync(infoPlistPath, 'utf8');
    writeFileSync(infoPlistPath, patchIOSAppDisplayName(infoPlist, suffix));

    const appGroup = `group.${[baseIdentifier, suffix].filter(Boolean).join('.')}`;
    const entitlements = entitlementContents(appGroup);
    for (const entitlementFile of APP_GROUP_ENTITLEMENT_FILES) {
        writeFileSync(resolve(iosDirectory, entitlementFile), entitlements);
    }

    console.log('Configured Mobile-Expensify for automatic iOS signing.');
    console.table({
        developmentTeam: options.developmentTeam,
        debugBundleIdentifier: targetBundleIdentifier(baseIdentifier, 'Expensify', 'Debug', suffix),
        releaseBundleIdentifier: targetBundleIdentifier(baseIdentifier, 'Expensify', 'Release', suffix),
        appGroup,
    });
}

/** Rewrites Android package, Firebase, shortcut, manifest, and label settings for a side-by-side local installation. */
function bootstrapAndroidForDevice(options: AndroidBootstrapOptions): void {
    const androidDirectory = resolve(options.rootDirectory, 'Mobile-Expensify/Android');
    const suffix = validateSuffix(options.suffix);
    const androidSuffix = suffix ? normalizeAndroidIdentifierSegment(suffix) : undefined;
    const baseIdentifier = validateAndroidApplicationID(options.bundleIdentifier);
    const applicationIDs = androidApplicationIDs(baseIdentifier, androidSuffix);

    const buildGradlePath = resolve(androidDirectory, 'build.gradle');
    const buildGradle = readFileSync(buildGradlePath, 'utf8');
    writeFileSync(buildGradlePath, patchAndroidBuildGradle(buildGradle, applicationIDs.release));

    const googleServicesPath = resolve(androidDirectory, 'google-services.json');
    const googleServices: unknown = JSON.parse(readFileSync(googleServicesPath, 'utf8'));
    writeFileSync(googleServicesPath, `${JSON.stringify(patchGoogleServicesConfig(googleServices, applicationIDs), null, 2)}\n`);

    const manifestPath = resolve(androidDirectory, 'AndroidManifest.xml');
    writeFileSync(manifestPath, patchAndroidManifest(readFileSync(manifestPath, 'utf8')));

    const shortcutsByBuildType = {
        release: 'res/xml-v25/shortcuts.xml',
        debug: 'build-types/debug/res/xml-v25/shortcuts.xml',
        adhoc: 'build-types/adhoc/res/xml-v25/shortcuts.xml',
    } as const;
    for (const buildType of ['release', 'debug', 'adhoc'] as const) {
        const relativePath = shortcutsByBuildType[buildType];
        const shortcutsPath = resolve(androidDirectory, relativePath);
        writeFileSync(shortcutsPath, patchAndroidShortcutPackage(readFileSync(shortcutsPath, 'utf8'), applicationIDs[buildType]));
    }

    const suffixLabel = suffix ? ` (${suffix})` : '';
    const appNamesByBuildType = {
        release: {path: 'res/values/strings.xml', name: `Expensify${suffixLabel}`},
        debug: {path: 'build-types/debug/res/values/strings.xml', name: `Expensify Debug${suffixLabel}`},
        adhoc: {path: 'build-types/adhoc/res/values/strings.xml', name: `Expensify AdHoc${suffixLabel}`},
    } as const;
    for (const {path, name} of Object.values(appNamesByBuildType)) {
        const stringsPath = resolve(androidDirectory, path);
        writeFileSync(stringsPath, patchAndroidAppName(readFileSync(stringsPath, 'utf8'), name));
    }

    console.log('Configured Mobile-Expensify for local Android release builds.');
    console.table(applicationIDs);
    console.warn(
        'Firebase resources are reused from the registered Expensify clients. Google Sign-In and other package/signature-restricted Google APIs will not work for synthetic application IDs.',
    );
}

async function main(rootDirectory: string): Promise<void> {
    // The CLI framework requires kebab-case named argument keys, which the naming-convention rule cannot express.
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'platform',
                description: `Native platform to bootstrap (${PLATFORMS.join(', ')})`,
                default: 'ios' as Platform,
                parse: parsePlatform,
            },
        ],
        namedArgs: {
            'development-team': {
                description: 'Apple Developer team ID used for automatic signing',
                required: false,
            },
            'bundle-identifier': {
                description: 'Base bundle identifier or Android application ID for the Expensify app',
                required: false,
            },
            suffix: {
                description: 'Optional segment appended to the base bundle identifier',
                required: false,
            },
            'github-username': {
                description: 'GitHub username used to create the default bundle identifier (defaults to the GH_TOKEN or GITHUB_TOKEN user)',
                required: false,
            },
        },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    const platform = parsePlatform(String(cli.positionalArgs.platform));
    const username = cli.namedArgs['github-username'] ?? (cli.namedArgs['bundle-identifier'] ? undefined : await githubUsername());
    const bundleIdentifier = cli.namedArgs['bundle-identifier'] ?? defaultBundleIdentifier(username ?? '', platform);
    if (platform === 'android') {
        bootstrapAndroidForDevice({rootDirectory, bundleIdentifier, suffix: cli.namedArgs.suffix});
        return;
    }
    const developmentTeam = await resolveDevelopmentTeam(cli.namedArgs['development-team']);
    bootstrapIOSForDevice({
        rootDirectory,
        developmentTeam,
        bundleIdentifier,
        suffix: cli.namedArgs.suffix,
    });
}

export {
    androidApplicationIDs,
    bootstrapAndroidForDevice,
    bootstrapIOSForDevice,
    defaultBundleIdentifier,
    entitlementContents,
    installedDevelopmentTeams,
    main,
    parseDevelopmentTeamFromProvisioningProfile,
    patchIOSAppDisplayName,
    patchAndroidAppName,
    patchAndroidBuildGradle,
    patchAndroidManifest,
    patchAndroidShortcutPackage,
    patchGoogleServicesConfig,
    patchProject,
    resolveDevelopmentTeam,
    targetBundleIdentifier,
    validateSuffix,
    validateAndroidApplicationID,
};
export type {AndroidApplicationIDs, AndroidBootstrapOptions, BootstrapOptions, Configuration, DevelopmentTeam, Platform, Target};
