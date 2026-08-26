// cspell:ignore tisa

import {
    defaultBundleIdentifier,
    entitlementContents,
    parseDevelopmentTeamFromProvisioningProfile,
    patchIOSAppDisplayName,
    patchProject,
    resolveDevelopmentTeam,
    targetBundleIdentifier,
    validateSuffix,
} from '../../scripts/bootstrapForDevice';

const configuration = (identifier: string, name: string, bundleIdentifier: string) => `
\t\t${identifier} /* ${name} */ = {
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {
\t\t\t\tCODE_SIGN_IDENTITY = "iPhone Developer";
\t\t\t\t"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = "iPhone Developer";
\t\t\t\tCODE_SIGN_STYLE = Manual;
\t\t\t\tDEVELOPMENT_TEAM = 368M544MTT;
\t\t\t\t"DEVELOPMENT_TEAM[sdk=iphoneos*]" = 368M544MTT;
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = ${bundleIdentifier};
\t\t\t\tPROVISIONING_PROFILE = old-profile;
\t\t\t\tPROVISIONING_PROFILE_SPECIFIER = "Old profile";
\t\t\t};
\t\t\tname = ${name};
\t\t};`;

const targetList = (target: string, prefix: string) => `
\t\t${prefix}FFFFFF /* Build configuration list for PBXNativeTarget "${target}" */ = {
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = (
\t\t\t\t${prefix}000001 /* Debug */,
\t\t\t\t${prefix}000002 /* Release */,
\t\t\t\t${prefix}000003 /* AdHoc */,
\t\t\t);
\t\t};`;

const targets = [
    ['Expensify', 'AAAAAAAAAAAAAAAAAA'],
    ['SmartScanExtension', 'BBBBBBBBBBBBBBBBBB'],
    ['NotificationServiceExtension', 'CCCCCCCCCCCCCCCCCC'],
    ['LiveActivityExtension', 'DDDDDDDDDDDDDDDDDD'],
    ['ExpensifyTests', 'EEEEEEEEEEEEEEEEEE'],
] as const;

function projectFixture(): string {
    return targets
        .flatMap(([target, prefix]) => [
            configuration(`${prefix}000001`, 'Debug', `com.expensify.${target}`),
            configuration(`${prefix}000002`, 'Release', `com.expensify.${target}`),
            configuration(`${prefix}000003`, 'AdHoc', `com.expensify.adhoc.${target}`),
            targetList(target, prefix),
        ])
        .join('\n');
}

describe('bootstrapIOSForDevice', () => {
    test('reads a development team from an unexpired provisioning profile', () => {
        const profile = `
            <key>ExpirationDate</key><date>2030-01-01T00:00:00Z</date>
            <key>TeamIdentifier</key><array><string>ABCDEFGHIJ</string></array>
            <key>TeamName</key><string>Example &amp; Company</string>`;

        expect(parseDevelopmentTeamFromProvisioningProfile(profile, new Date('2029-01-01'))).toEqual({id: 'ABCDEFGHIJ', name: 'Example & Company'});
    });

    test('ignores an expired provisioning profile', () => {
        const profile = `
            <key>ExpirationDate</key><date>2028-01-01T00:00:00Z</date>
            <key>TeamIdentifier</key><array><string>ABCDEFGHIJ</string></array>
            <key>TeamName</key><string>Example</string>`;

        expect(parseDevelopmentTeamFromProvisioningProfile(profile, new Date('2029-01-01'))).toBeUndefined();
    });

    test('uses an explicitly provided development team without prompting', async () => {
        const prompt = jest.fn();

        await expect(resolveDevelopmentTeam('ABCDEFGHIJ', [], prompt)).resolves.toBe('ABCDEFGHIJ');
        expect(prompt).not.toHaveBeenCalled();
    });

    test('prompts for a development team when one is not provided', async () => {
        const teams = [{id: 'ABCDEFGHIJ', name: 'Example'}];
        const prompt = jest.fn().mockResolvedValue('ABCDEFGHIJ');

        await expect(resolveDevelopmentTeam(undefined, teams, prompt)).resolves.toBe('ABCDEFGHIJ');
        expect(prompt).toHaveBeenCalledWith(teams);
    });

    test('creates the default bundle identifier from a GitHub username', () => {
        expect(defaultBundleIdentifier('Example-Developer')).toBe('com.example-developer.expensify.expensifylite');
    });

    test('keeps extensions beneath the app bundle identifier', () => {
        expect(targetBundleIdentifier('com.example.expensify', 'LiveActivityExtension', 'Release', 'local')).toBe('com.example.expensify.local.LiveActivityExtension');
        expect(targetBundleIdentifier('com.example.expensify', 'SmartScanExtension', 'AdHoc', 'local')).toBe('com.example.expensify.local.adhoc.SmartScanExtension');
    });

    test('rejects an invalid suffix', () => {
        expect(() => validateSuffix('not.valid')).toThrow('Bundle identifier suffix');
    });

    test('adds the suffix to the iOS app display name in parentheses', () => {
        const productNameBuildSetting = ['$', '{PRODUCT_NAME}'].join('');
        const infoPlist = `<key>CFBundleDisplayName</key>\n<string>${productNameBuildSetting}</string>`;

        expect(patchIOSAppDisplayName(infoPlist, 'branch')).toBe('<key>CFBundleDisplayName</key>\n<string>Expensify (branch)</string>');
        expect(patchIOSAppDisplayName(infoPlist, undefined)).toBe('<key>CFBundleDisplayName</key>\n<string>Expensify</string>');
    });

    test('replaces an existing iOS app display name suffix', () => {
        const infoPlist = '<key>CFBundleDisplayName</key>\n<string>Expensify (old)</string>';

        expect(patchIOSAppDisplayName(infoPlist, 'new')).toBe('<key>CFBundleDisplayName</key>\n<string>Expensify (new)</string>');
    });

    test('patches debug, release, and adhoc configurations for every target', () => {
        const patched = patchProject(projectFixture(), 'com.example.expensify', 'local', 'ABCDEFGHIJ');

        expect(patched.match(/CODE_SIGN_STYLE = Automatic;/g)).toHaveLength(15);
        expect(patched.match(/DEVELOPMENT_TEAM = ABCDEFGHIJ;/g)).toHaveLength(15);
        expect(patched).not.toContain('Old profile');
        expect(patched).not.toContain('368M544MTT');
        expect(patched).toContain('PRODUCT_BUNDLE_IDENTIFIER = com.example.expensify.local;');
        expect(patched).toContain('PRODUCT_BUNDLE_IDENTIFIER = com.example.expensify.local.adhoc.LiveActivityExtension;');
        expect(patched).toContain('CODE_SIGN_ENTITLEMENTS = Expensify/ExpensifyRelease.entitlements;');
    });

    test('is idempotent', () => {
        const once = patchProject(projectFixture(), 'com.example.expensify', undefined, 'ABCDEFGHIJ');
        expect(patchProject(once, 'com.example.expensify', undefined, 'ABCDEFGHIJ')).toBe(once);
    });

    test('only grants the application group entitlement', () => {
        const contents = entitlementContents('group.com.example.expensify');
        expect(contents).toContain('<string>group.com.example.expensify</string>');
        expect(contents).not.toContain('aps-environment');
        expect(contents).not.toContain('associated-domains');
    });
});
