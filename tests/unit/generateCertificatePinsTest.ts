import {spawnSync} from 'child_process';
import {X509Certificate} from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import tls from 'tls';

/**
 * Regression tests for scripts/generateCertificatePins.sh: clean generation, --refresh, unreachable
 * hosts under --verify, and pins.json / the native pin lists staying in sync with what the script
 * generates.
 *
 * The script normally downloads the Mozilla CA bundle. These tests never touch the network: they feed
 * the script Node's bundled copy of the Mozilla root store (tls.rootCertificates) through ROOTS_BUNDLE,
 * and point the root cache (ROOTS_DIR) at a temp directory so the real cache under
 * config/certificatePinning/roots/ is never read or written.
 */

jest.setTimeout(120000);

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'scripts/generateCertificatePins.sh');
const pinsJsonPath = path.join(repoRoot, 'config/certificatePinning/pins.json');
const nativePinFiles = [
    'android/app/src/main/java/com/expensify/chat/CertificatePinning.kt',
    'android/app/src/main/res/xml/network_security_config_enforce.xml',
    'ios/CertificatePinning.swift',
    'patches/react-native-nitro-fetch/react-native-nitro-fetch+1.5.4+001+certificate-pinning.patch',
];

const CLOUDFLARE_GROUP_HEADER = '=== Groups A-D: Cloudflare-fronted expensify.com hosts ===';
const CLOUDFRONT_GROUP_HEADER = '=== Group E: CloudFront CDN ===';
const DOMAIN_LIST_HEADER = 'Domain -> group:';
const PIN_LINE_REGEX = /^ {2}sha256\/([A-Za-z0-9+/]{43}=)\s+\[/gm;
const MANIFEST_ENTRY_REGEX = /^\s*"([^"|]+)\|(?:[0-9A-F]{2}:){31}[0-9A-F]{2}"\s*$/gm;
const BASE64_SHA256_REGEX = /[A-Za-z0-9+/]{43}=/g;

/** The parts of config/certificatePinning/pins.json these tests care about (`roots` is the file's `_roots`). */
type PinsJson = {
    roots: Record<string, string>;
    domains: Record<string, {hashes: string[]}>;
};

type ScriptRun = {
    status: number | null;
    stdout: string;
    stderr: string;
};

type GeneratedPins = {
    cloudflare: string[];
    cloudfront: string[];
};

let tmpRoot: string;
let fullBundlePath: string;
let bundleWithoutIsrgX2Path: string;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function readPinsJson(): PinsJson {
    const parsed: unknown = JSON.parse(fs.readFileSync(pinsJsonPath, 'utf8'));
    if (!isRecord(parsed)) {
        throw new Error('pins.json is not a JSON object');
    }
    const {_roots: roots, domains} = parsed;
    if (!isRecord(roots) || !isRecord(domains)) {
        throw new Error('pins.json must have "_roots" and "domains" objects');
    }

    const domainPins: Record<string, {hashes: string[]}> = {};
    for (const [domain, entry] of Object.entries(domains)) {
        if (!isRecord(entry) || !isStringArray(entry.hashes)) {
            throw new Error(`pins.json domain "${domain}" must have a "hashes" string array`);
        }
        domainPins[domain] = {hashes: entry.hashes};
    }

    return {
        roots: Object.fromEntries(Object.entries(roots).map(([hash, name]) => [hash, String(name)])),
        domains: domainPins,
    };
}

function manifestRootNames(): string[] {
    const script = fs.readFileSync(scriptPath, 'utf8');
    return Array.from(script.matchAll(MANIFEST_ENTRY_REGEX), (match) => match[1]);
}

function runScript(args: string[], env: Record<string, string>): ScriptRun {
    const result = spawnSync('bash', [scriptPath, ...args], {
        cwd: repoRoot,
        encoding: 'utf8',
        env: {...process.env, ...env},
    });
    return {status: result.status, stdout: result.stdout, stderr: result.stderr};
}

function newCacheDir(): string {
    return fs.mkdtempSync(path.join(tmpRoot, 'roots-'));
}

function cachedRoots(cacheDir: string): string[] {
    return fs
        .readdirSync(cacheDir)
        .filter((name) => name.endsWith('.pem'))
        .map((name) => name.slice(0, -'.pem'.length))
        .sort();
}

function pinsBetween(stdout: string, startMarker: string, endMarker: string): string[] {
    const start = stdout.indexOf(startMarker);
    const end = stdout.indexOf(endMarker, start);
    if (start === -1 || end === -1) {
        throw new Error(`Could not find "${startMarker}" / "${endMarker}" in the script output:\n${stdout}`);
    }
    return Array.from(stdout.slice(start, end).matchAll(PIN_LINE_REGEX), (match) => match[1]);
}

function parseGeneratedPins(stdout: string): GeneratedPins {
    return {
        cloudflare: pinsBetween(stdout, CLOUDFLARE_GROUP_HEADER, CLOUDFRONT_GROUP_HEADER),
        cloudfront: pinsBetween(stdout, CLOUDFRONT_GROUP_HEADER, DOMAIN_LIST_HEADER),
    };
}

/**
 * Puts a fake `openssl` first on PATH that fails every `s_client` call (as an unreachable host would)
 * and delegates everything else to the real binary, so --verify can be exercised without network.
 */
function pathWithUnreachableOpenssl(): string {
    const realOpenssl = spawnSync('bash', ['-c', 'command -v openssl'], {encoding: 'utf8'}).stdout.trim();
    if (!realOpenssl) {
        throw new Error('openssl is required to run generateCertificatePins.sh');
    }
    const shimDir = fs.mkdtempSync(path.join(tmpRoot, 'openssl-shim-'));
    const shimPath = path.join(shimDir, 'openssl');
    fs.writeFileSync(shimPath, `#!/bin/bash\nif [ "$1" = "s_client" ]; then exit 1; fi\nexec "${realOpenssl}" "$@"\n`, {mode: 0o755});
    return `${shimDir}${path.delimiter}${process.env.PATH ?? ''}`;
}

beforeAll(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'generateCertificatePins-'));

    // Node ships Mozilla's root store, which is exactly what the script downloads from curl.se.
    const roots = tls.rootCertificates;
    fullBundlePath = path.join(tmpRoot, 'full.pem');
    fs.writeFileSync(fullBundlePath, `${roots.join('\n')}\n`);

    // A bundle from which one pinned root has "disappeared", as happened to GTS Root R2 in 2026.
    const withoutIsrgX2 = roots.filter((pem) => !new X509Certificate(pem).subject.includes('CN=ISRG Root X2'));
    expect(withoutIsrgX2).toHaveLength(roots.length - 1);
    bundleWithoutIsrgX2Path = path.join(tmpRoot, 'without-isrg-x2.pem');
    fs.writeFileSync(bundleWithoutIsrgX2Path, `${withoutIsrgX2.join('\n')}\n`);
});

afterAll(() => {
    fs.rmSync(tmpRoot, {recursive: true, force: true});
});

describe('generateCertificatePins.sh', () => {
    describe('clean generation', () => {
        it('downloads, verifies and caches every manifest root from an empty cache', () => {
            const cacheDir = newCacheDir();
            const run = runScript([], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: fullBundlePath});

            expect(run.stderr).not.toMatch(/ERROR/);
            expect(run.status).toBe(0);
            expect(cachedRoots(cacheDir)).toEqual([...manifestRootNames()].sort());

            const generated = parseGeneratedPins(run.stdout);
            expect(generated.cloudflare.length + generated.cloudfront.length).toBe(manifestRootNames().length);
        });

        it('keeps pins.json and the native pin lists in sync with the generated pins', () => {
            const run = runScript([], {ROOTS_DIR: newCacheDir(), ROOTS_BUNDLE: fullBundlePath});
            expect(run.status).toBe(0);

            const generated = parseGeneratedPins(run.stdout);
            const pins = readPinsJson();

            expect(Object.keys(pins.roots).sort()).toEqual([...generated.cloudflare, ...generated.cloudfront].sort());
            for (const [domain, {hashes}] of Object.entries(pins.domains)) {
                const expected = domain.endsWith('.cloudfront.net') ? generated.cloudfront : generated.cloudflare;
                expect({domain, hashes}).toEqual({domain, hashes: expected});
            }

            for (const relativePath of nativePinFiles) {
                const contents = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
                for (const hash of Object.keys(pins.roots)) {
                    expect({file: relativePath, hash, present: contents.includes(hash)}).toEqual({file: relativePath, hash, present: true});
                }
                const unknownHashes = Array.from(contents.matchAll(BASE64_SHA256_REGEX), (match) => match[0]).filter((hash) => !(hash in pins.roots));
                expect({file: relativePath, unknownHashes}).toEqual({file: relativePath, unknownHashes: []});
            }
        });

        it('does not read the bundle again once every root is cached and verified', () => {
            const cacheDir = newCacheDir();
            expect(runScript([], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: fullBundlePath}).status).toBe(0);

            const run = runScript([], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: path.join(tmpRoot, 'does-not-exist.pem')});
            expect(run.status).toBe(0);
        });
    });

    describe('--refresh', () => {
        it('re-installs every root from the bundle', () => {
            const cacheDir = newCacheDir();
            expect(runScript([], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: fullBundlePath}).status).toBe(0);

            const run = runScript(['--refresh'], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: fullBundlePath});
            expect(run.status).toBe(0);
            expect(cachedRoots(cacheDir)).toEqual([...manifestRootNames()].sort());
        });

        it('fails and removes the stale cached copy of a root the bundle no longer carries', () => {
            const cacheDir = newCacheDir();
            expect(runScript([], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: fullBundlePath}).status).toBe(0);
            expect(fs.existsSync(path.join(cacheDir, 'ISRG_Root_X2.pem'))).toBe(true);

            const refresh = runScript(['--refresh'], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: bundleWithoutIsrgX2Path});
            expect(refresh.status).toBe(1);
            expect(refresh.stderr).toMatch(/ERROR: root 'ISRG_Root_X2' was not found in the CA bundle/);
            expect(fs.existsSync(path.join(cacheDir, 'ISRG_Root_X2.pem'))).toBe(false);
            expect(fs.existsSync(path.join(cacheDir, 'ISRG_Root_X1.pem'))).toBe(true);

            // A bundle that carries the root again fills the gap without --refresh.
            const restore = runScript([], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: fullBundlePath});
            expect(restore.status).toBe(0);
            expect(fs.existsSync(path.join(cacheDir, 'ISRG_Root_X2.pem'))).toBe(true);
        });
    });

    describe('--verify', () => {
        it('fails when a pinned host cannot be reached instead of silently skipping it', () => {
            const cacheDir = newCacheDir();
            const run = runScript(['--verify'], {
                ROOTS_DIR: cacheDir,
                ROOTS_BUNDLE: fullBundlePath,
                PATH: pathWithUnreachableOpenssl(),
            });

            expect(run.status).toBe(1);
            expect(run.stderr).toMatch(/Verification FAILED/);
            expect(run.stdout).not.toMatch(/ OK \(/);
            for (const domain of Object.keys(readPinsJson().domains)) {
                expect(run.stdout).toMatch(new RegExp(`^ {2}${domain.replaceAll('.', '\\.')}\\s+UNREACHABLE`, 'm'));
            }
        });
    });
});
