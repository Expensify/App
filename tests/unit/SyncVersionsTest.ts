/**
 * @jest-environment node
 */
import type {SpawnSyncReturns} from 'child_process';

import {execFileSync, spawnSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SCRIPT_PATH = path.resolve(__dirname, '../../.github/scripts/syncVersions.sh');

/**
 * These fixtures use local paths as git remotes, and the file transport has been blocked for submodules
 * since CVE-2022-39253. This re-enables it for every git process the script spawns, including the fetch
 * that `git submodule update --remote` runs inside the submodule.
 */
const GIT_ALLOW_FILE_TRANSPORT = {
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'protocol.file.allow',
    GIT_CONFIG_VALUE_0: 'always',
};

// PlistBuddy and BSD `sed -i ''` only exist on macOS, which is what the workflow runs on.
const describeMacOS = process.platform === 'darwin' ? describe : describe.skip;

type ScriptResult = SpawnSyncReturns<string> & {outputs: Record<string, string>};

let tmpRoot: string;
let appDir: string;

function git(cwd: string, ...args: string[]): string {
    // Pipe stderr rather than letting it reach the parent, so fixture setup doesn't spam the CI log
    return execFileSync('git', args, {cwd, encoding: 'utf-8', stdio: 'pipe', env: {...process.env, ...GIT_ALLOW_FILE_TRANSPORT}}).trim();
}

function readVersion(filePath: string): unknown {
    const parsed: unknown = JSON.parse(fs.readFileSync(filePath, {encoding: 'utf-8'}));
    if (typeof parsed !== 'object' || parsed === null || !('version' in parsed)) {
        throw new Error(`Expected ${filePath} to contain a version field`);
    }
    return parsed.version;
}

function writeJSON(filePath: string, contents: Record<string, unknown>) {
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
    fs.writeFileSync(filePath, `${JSON.stringify(contents, null, 4)}\n`);
}

/** Runs the script and parses whatever it wrote to GITHUB_OUTPUT back into a map. */
function runScript(command: string, options: {cwd?: string; env?: Record<string, string>; args?: string[]} = {}): ScriptResult {
    const outputFile = path.join(tmpRoot, `github-output-${Math.random().toString(36).slice(2)}`);
    fs.writeFileSync(outputFile, '');

    const result = spawnSync(SCRIPT_PATH, [command, ...(options.args ?? [])], {
        cwd: options.cwd ?? appDir,
        encoding: 'utf-8',
        env: {
            ...process.env,
            ...GIT_ALLOW_FILE_TRANSPORT,
            GITHUB_OUTPUT: outputFile,
            ...options.env,
        },
    });

    const outputs: Record<string, string> = {};
    for (const line of fs.readFileSync(outputFile, {encoding: 'utf-8'}).split('\n')) {
        if (line) {
            const separatorIndex = line.indexOf('=');
            outputs[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1);
        }
    }

    return {...result, outputs};
}

/** Creates a bare remote plus a working clone with an initial commit on main. */
function createRepoWithRemote(name: string, populate: (workingDir: string) => void): {remote: string; workingDir: string} {
    const remote = path.join(tmpRoot, `${name}.git`);
    const workingDir = path.join(tmpRoot, name);

    execFileSync('git', ['init', '--bare', '--initial-branch=main', remote], {stdio: 'pipe'});
    execFileSync('git', ['init', '--initial-branch=main', workingDir], {stdio: 'pipe'});
    git(workingDir, 'config', 'user.name', 'test');
    git(workingDir, 'config', 'user.email', 'test@test.com');

    populate(workingDir);

    git(workingDir, 'add', '-A');
    git(workingDir, 'commit', '-m', `Initial ${name} commit`);
    git(workingDir, 'remote', 'add', 'origin', remote);
    git(workingDir, 'push', '-u', 'origin', 'main');

    return {remote, workingDir};
}

/** Adds a commit to Mobile-Expensify main, optionally changing its version, and returns the new SHA. */
function advanceMobileExpensify(version?: string): string {
    const workingDir = path.join(tmpRoot, 'Mobile-Expensify');
    if (version) {
        writeJSON(path.join(workingDir, 'app/config/config.json'), {meta: {version}});
    } else {
        fs.appendFileSync(path.join(workingDir, 'README.md'), 'more\n');
    }
    git(workingDir, 'add', '-A');
    git(workingDir, 'commit', '-m', version ? `Bump to ${version}` : 'Unrelated change');
    git(workingDir, 'push', 'origin', 'main');
    return git(workingDir, 'rev-parse', 'HEAD');
}

/**
 * Builds an App repo whose Mobile-Expensify submodule points at a real (local) Mobile-Expensify remote.
 * `fullSyncFixtures` adds the native files the full version sync path rewrites.
 */
function setUpFixture(appVersion: string, mobileExpensifyVersion: string, fullSyncFixtures = false) {
    const mobileExpensifyRemote = createRepoWithRemote('Mobile-Expensify', (workingDir) => {
        writeJSON(path.join(workingDir, 'app/config/config.json'), {meta: {version: mobileExpensifyVersion}});
        fs.writeFileSync(path.join(workingDir, 'README.md'), 'Mobile-Expensify\n');
    }).remote;

    const app = createRepoWithRemote('App', (workingDir) => {
        writeJSON(path.join(workingDir, 'package.json'), {name: 'new.expensify', version: appVersion});

        if (!fullSyncFixtures) {
            return;
        }

        // `npm version` refuses to update a lockfile that isn't there, and rewrites the root package entry itself
        writeJSON(path.join(workingDir, 'package-lock.json'), {
            name: 'new.expensify',
            version: appVersion,
            lockfileVersion: 3,
            requires: true,
            packages: Object.fromEntries([['', {name: 'new.expensify', version: appVersion}]]),
        });
        fs.mkdirSync(path.join(workingDir, 'android/app'), {recursive: true});
        fs.writeFileSync(
            path.join(workingDir, 'android/app/build.gradle'),
            ['android {', '    defaultConfig {', `        versionCode 1009031000`, `        versionName "${appVersion}"`, '    }', '}', ''].join('\n'),
        );
        for (const target of ['NewExpensify', 'NotificationServiceExtension', 'ShareViewController']) {
            fs.mkdirSync(path.join(workingDir, 'ios', target), {recursive: true});
            fs.writeFileSync(
                path.join(workingDir, 'ios', target, 'Info.plist'),
                [
                    '<?xml version="1.0" encoding="UTF-8"?>',
                    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
                    '<plist version="1.0">',
                    '<dict>',
                    '\t<key>CFBundleShortVersionString</key>',
                    '\t<string>0.0.0</string>',
                    '\t<key>CFBundleVersion</key>',
                    '\t<string>0.0.0.0</string>',
                    '</dict>',
                    '</plist>',
                    '',
                ].join('\n'),
            );
        }
    });

    appDir = app.workingDir;

    git(appDir, 'submodule', 'add', mobileExpensifyRemote, 'Mobile-Expensify');
    git(appDir, 'commit', '-m', 'Add Mobile-Expensify submodule');
    git(appDir, 'push', 'origin', 'main');
}

beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'syncVersions-'));
});

afterEach(() => {
    fs.rmSync(tmpRoot, {recursive: true, force: true});
});

describe('syncVersions.sh version-components', () => {
    // Mirrors generateAndroidVersionCode in scripts/bumpVersion.ts: prefix 10, then two digits each for major/minor/patch/build
    it.each([
        ['9.3.11-48', {SHORT_VERSION: '9.3.11', BUILD_NUMBER: '48', CF_VERSION: '9.3.11.48', ANDROID_VERSION_CODE: '1009031148'}],
        ['1.2.3-4', {SHORT_VERSION: '1.2.3', BUILD_NUMBER: '4', CF_VERSION: '1.2.3.4', ANDROID_VERSION_CODE: '1001020304'}],
        ['10.20.30-40', {SHORT_VERSION: '10.20.30', BUILD_NUMBER: '40', CF_VERSION: '10.20.30.40', ANDROID_VERSION_CODE: '1010203040'}],
    ])('derives the native version components of %s', (version, expected) => {
        const result = runScript('version-components', {cwd: tmpRoot, args: [version]});

        expect(result.status).toBe(0);
        expect(
            Object.fromEntries(
                result.stdout
                    .trim()
                    .split('\n')
                    .map((line) => line.split('=')),
            ),
        ).toEqual(expected);
    });

    it('fails without a version argument', () => {
        const result = runScript('version-components', {cwd: tmpRoot});

        expect(result.status).toBe(1);
        expect(result.stdout).toContain('::error::');
    });

    it('fails on an unknown subcommand', () => {
        const result = runScript('not-a-command', {cwd: tmpRoot});

        expect(result.status).toBe(1);
        expect(result.stdout).toContain('::error::Usage:');
    });
});

describe('syncVersions.sh check', () => {
    it('reports in sync when versions and the submodule pointer match', () => {
        setUpFixture('9.3.11-48', '9.3.11-48');

        const result = runScript('check');

        expect(result.status).toBe(0);
        expect(result.outputs.IN_SYNC).toBe('true');
        expect(result.outputs.NEED_FULL_VERSION_SYNC).toBe('false');
        expect(result.stdout).toContain('::notice::✅ Versions and submodule are in sync');
    });

    it('requests a full version sync when the versions differ', () => {
        setUpFixture('9.3.10-1', '9.3.11-48');

        const result = runScript('check');

        expect(result.status).toBe(0);
        expect(result.outputs.IN_SYNC).toBe('false');
        expect(result.outputs.NEED_FULL_VERSION_SYNC).toBe('true');
        expect(result.stdout).toContain('::warning::⚠️ Versions are out of sync');
    });

    it('requests a submodule-only bump when the versions match but the pointer is behind', () => {
        setUpFixture('9.3.11-48', '9.3.11-48');
        const newSubmoduleSha = advanceMobileExpensify();

        const result = runScript('check');

        expect(result.status).toBe(0);
        expect(result.outputs.IN_SYNC).toBe('false');
        expect(result.outputs.NEED_FULL_VERSION_SYNC).toBe('false');
        expect(result.outputs.ACTUAL_SHA).toBe(newSubmoduleSha);
        expect(result.stdout).toContain('::warning::⚠️ Submodule pointer is behind Mobile-Expensify main');
    });
});

describe('syncVersions.sh sync (submodule only)', () => {
    it('commits and pushes the new submodule pointer, then verifies', () => {
        setUpFixture('9.3.11-48', '9.3.11-48');
        const newSubmoduleSha = advanceMobileExpensify();
        runScript('check');

        const result = runScript('sync', {env: {NEED_FULL_VERSION_SYNC: 'false', EXPECTED_SUBMODULE_SHA: newSubmoduleSha}});

        expect(result.status).toBe(0);
        expect(result.outputs.POST_SYNC_APP_VERSION).toBe('9.3.11-48');
        expect(git(appDir, 'ls-tree', 'origin/main', 'Mobile-Expensify')).toContain(newSubmoduleSha);
        expect(git(appDir, 'log', '-1', '--format=%s', 'origin/main')).toBe(`Bump Mobile-Expensify submodule to latest main (${newSubmoduleSha})`);
    });

    it('fails when the submodule checkout moved since the check step', () => {
        setUpFixture('9.3.11-48', '9.3.11-48');
        advanceMobileExpensify();
        runScript('check');

        const result = runScript('sync', {env: {NEED_FULL_VERSION_SYNC: 'false', EXPECTED_SUBMODULE_SHA: '0'.repeat(40)}});

        expect(result.status).toBe(1);
        expect(result.stdout).toContain('::error::Mobile-Expensify checkout');
        expect(git(appDir, 'log', '-1', '--format=%s', 'origin/main')).toBe('Add Mobile-Expensify submodule');
    });
});

describeMacOS('syncVersions.sh sync (full version)', () => {
    it('rewrites the App version across package.json, Android and iOS, then pushes and verifies', () => {
        setUpFixture('9.3.10-1', '9.3.11-48', true);
        // A real version drift always comes with the submodule pointer being behind, since Mobile-Expensify is bumped first
        advanceMobileExpensify();
        runScript('check');

        const result = runScript('sync', {env: {NEED_FULL_VERSION_SYNC: 'true'}});

        expect(result.status).toBe(0);
        expect(result.outputs.POST_SYNC_APP_VERSION).toBe('9.3.11-48');

        expect(readVersion(path.join(appDir, 'package.json'))).toBe('9.3.11-48');

        const buildGradle = fs.readFileSync(path.join(appDir, 'android/app/build.gradle'), {encoding: 'utf-8'});
        expect(buildGradle).toContain('versionName "9.3.11-48"');
        expect(buildGradle).toContain('versionCode 1009031148');

        for (const target of ['NewExpensify', 'NotificationServiceExtension', 'ShareViewController']) {
            const plist = path.join(appDir, 'ios', target, 'Info.plist');
            expect(execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleShortVersionString', plist], {encoding: 'utf-8'}).trim()).toBe('9.3.11');
            expect(execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleVersion', plist], {encoding: 'utf-8'}).trim()).toBe('9.3.11.48');
        }

        expect(git(appDir, 'log', '-2', '--format=%s', 'origin/main').split('\n')).toEqual([
            'Update Mobile-Expensify submodule version to 9.3.11-48 (sync recovery)',
            'Update version to 9.3.11-48 (sync recovery)',
        ]);
    }, 120000);

    it('uses TARGET_VERSION when it is provided', () => {
        setUpFixture('9.3.10-1', '9.3.11-48', true);
        // A real version drift always comes with the submodule pointer being behind, since Mobile-Expensify is bumped first
        advanceMobileExpensify();
        runScript('check');

        const result = runScript('sync', {env: {NEED_FULL_VERSION_SYNC: 'true', TARGET_VERSION: '9.3.11-48'}});

        expect(result.status).toBe(0);
        expect(result.stderr).toContain('Using provided target version: 9.3.11-48');
        expect(result.outputs.POST_SYNC_APP_VERSION).toBe('9.3.11-48');
    }, 120000);

    it('fails verification when the target version does not match Mobile-Expensify', () => {
        setUpFixture('9.3.10-1', '9.3.11-48', true);
        // A real version drift always comes with the submodule pointer being behind, since Mobile-Expensify is bumped first
        advanceMobileExpensify();
        runScript('check');

        const result = runScript('sync', {env: {NEED_FULL_VERSION_SYNC: 'true', TARGET_VERSION: '9.9.9-9'}});

        expect(result.status).toBe(1);
        expect(result.stdout).toContain("::error::Sync failed! Versions still don't match");
    }, 120000);
});
