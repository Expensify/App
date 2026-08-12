#!/usr/bin/env bun

import type {TupleToUnion} from 'type-fest';

import CLI from 'expensify-common/CLI';
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import process from 'node:process';

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
type BootstrapOptions = {
    rootDirectory: string;
    developmentTeam: string;
    bundleIdentifier: string;
    suffix?: string;
};

function fail(message: string): never {
    throw new Error(message);
}

function validateIdentifier(value: string, label: string): string {
    if (!BUNDLE_IDENTIFIER_PATTERN.test(value)) {
        fail(`${label} must contain dot-separated letters, numbers, or hyphens. Received: ${value}`);
    }
    return value;
}

function validateSuffix(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    if (!/^[A-Za-z0-9-]+$/.test(value)) {
        fail(`Bundle identifier suffix must contain only letters, numbers, or hyphens. Received: ${value}`);
    }
    return value;
}

function githubUsername(): string {
    try {
        return execFileSync('gh', ['api', 'user', '--jq', '.login'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']})
            .trim()
            .toLowerCase();
    } catch {
        fail('Could not determine your GitHub username. Authenticate gh or pass --github-username/--bundle-identifier.');
    }
}

function defaultBundleIdentifier(username: string): string {
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(normalizedUsername)) {
        fail(`GitHub username cannot be used in a bundle identifier: ${username}`);
    }
    return `com.${normalizedUsername}.expensify.expensifylite`;
}

function targetBundleIdentifier(baseIdentifier: string, target: Target, configuration: Configuration, suffix?: string): string {
    const configurationSuffix = configuration === 'AdHoc' ? 'adhoc' : undefined;
    const targetSuffix = target === 'Expensify' ? undefined : target;
    return [baseIdentifier, suffix, configurationSuffix, targetSuffix].filter(Boolean).join('.');
}

function configurationIDsByTarget(project: string): Map<Target, Map<Configuration, string>> {
    const result = new Map<Target, Map<Configuration, string>>();
    for (const target of TARGETS) {
        const listPattern = new RegExp(`\\/\\* Build configuration list for PBXNativeTarget "${target}" \\*\\/ = \\{[\\s\\S]*?buildConfigurations = \\(\\s*([\\s\\S]*?)\\s*\\);`);
        const list = project.match(listPattern)?.at(1);
        if (!list) {
            fail(`Could not find build configurations for the ${target} target.`);
        }
        const configurations = new Map<Configuration, string>();
        for (const configuration of CONFIGURATIONS) {
            const identifier = list.match(new RegExp(`([A-F0-9]{24}) \\/\\* ${configuration} \\*\\/`))?.at(1);
            if (identifier) {
                configurations.set(configuration, identifier);
            }
        }
        if (!configurations.has('Debug') || !configurations.has('Release')) {
            fail(`The ${target} target must have both Debug and Release configurations.`);
        }
        result.set(target, configurations);
    }
    return result;
}

function setBuildSetting(block: string, key: string, value: string): string {
    const escapedKey = key.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^(\\s*)"?${escapedKey}"? = [^;]*;$`, 'gm');
    if (pattern.test(block)) {
        return block.replaceAll(pattern, (_line, indentation: string) => `${indentation}${key} = ${value};`);
    }
    return block.replace(/(\n\s*buildSettings = \{)/, `$1\n\t\t\t\t${key} = ${value};`);
}

function removeBuildSetting(block: string, key: string): string {
    const escapedKey = key.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return block.replaceAll(new RegExp(`^\\s*"?${escapedKey}"? = [^;]*;\\n`, 'gm'), '');
}

function patchBuildConfiguration(project: string, identifier: string, bundleIdentifier: string, developmentTeam: string, releaseEntitlements: boolean): string {
    const blockPattern = new RegExp(`(^\\s*${identifier} \\/\\* [^*]+ \\*\\/ = \\{[\\s\\S]*?^\\s*\\};)`, 'm');
    const block = project.match(blockPattern)?.at(1);
    if (!block) {
        fail(`Could not find build configuration ${identifier}.`);
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

function patchProject(project: string, baseIdentifier: string, suffix: string | undefined, developmentTeam: string): string {
    const configurationsByTarget = configurationIDsByTarget(project);
    let patched = project.replaceAll('ProvisioningStyle = Manual;', 'ProvisioningStyle = Automatic;');

    for (const target of TARGETS) {
        const configurations = configurationsByTarget.get(target);
        if (!configurations) {
            fail(`Could not find configurations for ${target}.`);
        }
        for (const [configuration, identifier] of configurations) {
            const bundleIdentifier = targetBundleIdentifier(baseIdentifier, target, configuration, suffix);
            patched = patchBuildConfiguration(patched, identifier, bundleIdentifier, developmentTeam, target === 'Expensify' && configuration === 'Release');
        }
    }
    return patched;
}

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

function bootstrapIOSForDevice(options: BootstrapOptions): void {
    const iosDirectory = resolve(options.rootDirectory, 'Mobile-Expensify/iOS');
    const projectPath = resolve(iosDirectory, 'Expensify.xcodeproj/project.pbxproj');
    const suffix = validateSuffix(options.suffix);
    const baseIdentifier = validateIdentifier(options.bundleIdentifier, 'Bundle identifier');
    if (!TEAM_ID_PATTERN.test(options.developmentTeam)) {
        fail(`Apple development team must be a 10-character team ID. Received: ${options.developmentTeam}`);
    }

    const project = readFileSync(projectPath, 'utf8');
    const patchedProject = patchProject(project, baseIdentifier, suffix, options.developmentTeam);
    writeFileSync(projectPath, patchedProject);

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

function main(): void {
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        namedArgs: {
            'development-team': {
                description: 'Apple Developer team ID used for automatic signing',
                required: true,
            },
            'bundle-identifier': {
                description: 'Base bundle identifier for the Expensify app',
                required: false,
            },
            suffix: {
                description: 'Optional segment appended to the base bundle identifier',
                required: false,
            },
            'github-username': {
                description: 'GitHub username used to create the default bundle identifier (defaults to the authenticated gh user)',
                required: false,
            },
        },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    const username = cli.namedArgs['github-username'] ?? (cli.namedArgs['bundle-identifier'] ? undefined : githubUsername());
    const bundleIdentifier = cli.namedArgs['bundle-identifier'] ?? defaultBundleIdentifier(username ?? '');
    const scriptPath = process.argv.at(1);
    const rootDirectory = scriptPath ? resolve(dirname(resolve(scriptPath)), '..') : process.cwd();
    bootstrapIOSForDevice({
        rootDirectory,
        developmentTeam: cli.namedArgs['development-team'],
        bundleIdentifier,
        suffix: cli.namedArgs.suffix,
    });
}

const scriptPath = process.argv.at(1);
if (scriptPath?.endsWith('bootstrapIOSForDevice.ts')) {
    try {
        main();
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

export {bootstrapIOSForDevice, defaultBundleIdentifier, entitlementContents, patchProject, targetBundleIdentifier, validateSuffix};
export type {BootstrapOptions, Configuration, Target};
