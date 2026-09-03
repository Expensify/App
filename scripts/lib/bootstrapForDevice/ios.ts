import type {TupleToUnion} from 'type-fest';

import {file, write} from 'bun';
import {resolve} from 'node:path';

import type {BootstrapOptions} from './shared';

import {validateSuffix} from './shared';

const CONFIGURATIONS = ['Debug', 'Release', 'AdHoc'] as const;
const TARGETS = ['Expensify', 'SmartScanExtension', 'NotificationServiceExtension', 'LiveActivityExtension', 'ExpensifyTests'] as const;
const BUNDLE_IDENTIFIER_PATTERN = /^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
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

/** Rewrites the native iOS project, display name, and app-group entitlements for local device signing. */
async function bootstrapIOSForDevice(options: BootstrapOptions): Promise<void> {
    const iosDirectory = resolve(options.rootDirectory, 'Mobile-Expensify/iOS');
    const projectPath = resolve(iosDirectory, 'Expensify.xcodeproj/project.pbxproj');
    const suffix = validateSuffix(options.suffix);
    const baseIdentifier = validateIdentifier(options.bundleIdentifier, 'Bundle identifier');
    if (!TEAM_ID_PATTERN.test(options.developmentTeam)) {
        throw new Error(`Apple development team must be a 10-character team ID. Received: ${options.developmentTeam}`);
    }

    const project = await file(projectPath).text();
    const patchedProject = patchProject(project, baseIdentifier, suffix, options.developmentTeam);
    await write(projectPath, patchedProject);

    const infoPlistPath = resolve(iosDirectory, 'Expensify/Expensify-Info.plist');
    const infoPlist = await file(infoPlistPath).text();
    await write(infoPlistPath, patchIOSAppDisplayName(infoPlist, suffix));

    const appGroup = `group.${[baseIdentifier, suffix].filter(Boolean).join('.')}`;
    const entitlements = entitlementContents(appGroup);
    for (const entitlementFile of APP_GROUP_ENTITLEMENT_FILES) {
        await write(resolve(iosDirectory, entitlementFile), entitlements);
    }

    console.log('Configured Mobile-Expensify for automatic iOS signing.');
    console.table({
        developmentTeam: options.developmentTeam,
        debugBundleIdentifier: targetBundleIdentifier(baseIdentifier, 'Expensify', 'Debug', suffix),
        releaseBundleIdentifier: targetBundleIdentifier(baseIdentifier, 'Expensify', 'Release', suffix),
        appGroup,
    });
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

/** Adds the optional local suffix to the iOS display name so side-by-side installations remain distinguishable. */
function patchIOSAppDisplayName(infoPlist: string, suffix: string | undefined): string {
    const displayNamePattern = /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/;
    if (!displayNamePattern.test(infoPlist)) {
        throw new Error('Could not find CFBundleDisplayName in Mobile-Expensify/iOS/Expensify/Expensify-Info.plist.');
    }
    const suffixLabel = suffix ? ` (${suffix})` : '';
    return infoPlist.replace(displayNamePattern, `$1Expensify${suffixLabel}$2`);
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

/** Composes a unique bundle identifier from the local suffix, build configuration, and native target. */
function targetBundleIdentifier(baseIdentifier: string, target: Target, configuration: Configuration, suffix?: string): string {
    const configurationSuffix = configuration === 'AdHoc' ? 'adhoc' : undefined;
    const targetSuffix = target === 'Expensify' ? undefined : target;
    return [baseIdentifier, suffix, configurationSuffix, targetSuffix].filter(Boolean).join('.');
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

function validateIdentifier(value: string, label: string): string {
    if (!BUNDLE_IDENTIFIER_PATTERN.test(value)) {
        throw new Error(`${label} must contain dot-separated letters, numbers, or hyphens. Received: ${value}`);
    }
    return value;
}

export {bootstrapIOSForDevice, entitlementContents, patchIOSAppDisplayName, patchProject, targetBundleIdentifier};
export type {Configuration, Target};
