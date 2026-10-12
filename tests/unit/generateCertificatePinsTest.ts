import {spawnSync} from 'child_process';
import {X509Certificate} from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import tls from 'tls';

/**
 * Regression tests for scripts/generateCertificatePins.sh: clean generation, --refresh, retained pins,
 * what --verify accepts and rejects, and pins.json / the native pin lists staying in sync with what the
 * script generates.
 *
 * The script normally downloads the Mozilla CA bundle. These tests never touch the network: they feed
 * the script Node's bundled copy of the Mozilla root store (tls.rootCertificates) through ROOTS_BUNDLE,
 * and point the root cache (ROOTS_DIR) at a temp directory so the real cache under
 * config/certificatePinning/roots/ is never read or written.
 *
 * A root the Mozilla bundle has dropped while devices still anchor at it (GTS Root R2) ships as a
 * RETAINED_PINS entry: the script carries its committed hash forward instead of deriving one, so no
 * certificate for it is needed here and the suite runs the same on any Node. --verify re-checks such a
 * pin against the CA's published certificate, which is a network fetch, so `curl` is shimmed too.
 */

jest.setTimeout(120000);

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'scripts/generateCertificatePins.sh');
const pinsJsonPath = path.join(repoRoot, 'config/certificatePinning/pins.json');
const nativePinFiles = [
    'android/app/src/main/java/com/expensify/chat/CertificatePinning.kt',
    'android/app/src/main/res/xml/network_security_config_enforce.xml',
    'ios/CertificatePinning.swift',
    'patches/react-native-nitro-fetch/react-native-nitro-fetch+1.6.2+001+certificate-pinning.patch',
];

const CLOUDFLARE_GROUP_HEADER = '=== Groups A-D: Cloudflare-fronted expensify.com hosts ===';
const CLOUDFRONT_GROUP_HEADER = '=== Group E: CloudFront CDN ===';
const DOMAIN_LIST_HEADER = 'Domain -> group:';
const PIN_LINE_REGEX = /^ {2}sha256\/([A-Za-z0-9+/]{43}=)\s+\[/gm;
const MANIFEST_ENTRY_REGEX = /^\s*"([^"|]+)\|(?:[0-9A-F]{2}:){31}[0-9A-F]{2}"\s*$/gm;
const RETAINED_ENTRY_REGEX = /^\s*"([^"|]+)\|([A-Za-z0-9+/]{43}=)\|(?:[0-9A-F]{2}:){31}[0-9A-F]{2}\|[^"|]+\|[^"|]*"\s*$/gm;
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

/** RETAINED_PINS entries: roots that ship as a committed hash because the CA bundle no longer carries them. */
function retainedPins(): Array<{name: string; pin: string}> {
    const script = fs.readFileSync(scriptPath, 'utf8');
    return Array.from(script.matchAll(RETAINED_ENTRY_REGEX), (match) => ({name: match[1], pin: match[2]}));
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
 * Puts fake `openssl` and `curl` binaries first on PATH so --verify runs without network: `s_client`
 * either fails (an unreachable host) or prints a canned chain, and `curl` either fails or writes a
 * canned certificate to its -o path. Every other openssl call delegates to the real binary.
 */
function pathWithNetworkShims(options: {servedChain?: string; curlServes?: string} = {}): string {
    const realOpenssl = spawnSync('bash', ['-c', 'command -v openssl'], {encoding: 'utf8'}).stdout.trim();
    if (!realOpenssl) {
        throw new Error('openssl is required to run generateCertificatePins.sh');
    }
    const shimDir = fs.mkdtempSync(path.join(tmpRoot, 'shims-'));
    const sClient = options.servedChain ? `cat '${options.servedChain}'; exit 0` : 'exit 1';
    fs.writeFileSync(path.join(shimDir, 'openssl'), `#!/bin/bash\nif [ "$1" = "s_client" ]; then ${sClient}; fi\nexec "${realOpenssl}" "$@"\n`, {mode: 0o755});
    const curlBody = options.curlServes ? `prev=""; for a in "$@"; do if [ "$prev" = "-o" ]; then cp '${options.curlServes}' "$a"; exit 0; fi; prev="$a"; done; exit 1` : 'exit 7';
    fs.writeFileSync(path.join(shimDir, 'curl'), `#!/bin/bash\n${curlBody}\n`, {mode: 0o755});
    return `${shimDir}${path.delimiter}${process.env.PATH ?? ''}`;
}

/**
 * Mints a throwaway CA and a leaf it signs, plus an OpenSSL-style trust directory holding the CA.
 * Used to prove --verify does not accept a chain that anchors outside the pinned set, however the
 * machine's own trust store is configured.
 */
function makeUnpinnedCa(): {servedChain: string; trustDir: string} {
    const dir = fs.mkdtempSync(path.join(tmpRoot, 'unpinned-ca-'));
    const sh = (command: string) => {
        const result = spawnSync('bash', ['-c', command], {cwd: dir, encoding: 'utf8'});
        if (result.status !== 0) {
            throw new Error(`could not build the test CA: ${command}\n${result.stderr}`);
        }
    };
    sh('openssl req -x509 -newkey rsa:2048 -keyout ca.key -out ca.pem -days 2 -nodes -subj "/CN=Unpinned Test CA" 2>/dev/null');
    sh('openssl req -newkey rsa:2048 -keyout leaf.key -out leaf.csr -nodes -subj "/CN=test.example" 2>/dev/null');
    sh('openssl x509 -req -in leaf.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out leaf.pem -days 2 2>/dev/null');
    sh('cat leaf.pem ca.pem > served-chain.pem');
    // An OpenSSL trust directory is looked up by subject hash, so the CA needs its <hash>.0 link.
    sh('mkdir -p trustdir && cp ca.pem trustdir/ && ln -sf ca.pem "trustdir/$(openssl x509 -hash -noout -in ca.pem).0"');
    return {servedChain: path.join(dir, 'served-chain.pem'), trustDir: path.join(dir, 'trustdir')};
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
            expect(generated.cloudflare.length + generated.cloudfront.length).toBe(manifestRootNames().length + retainedPins().length);
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

    describe('retained pins', () => {
        it('is a non-empty set that never overlaps ROOT_MANIFEST', () => {
            const retained = retainedPins();
            expect(retained.length).toBeGreaterThan(0);
            expect(retained.map(({name}) => name).filter((name) => manifestRootNames().includes(name))).toEqual([]);
        });

        it('ships each retained pin without needing a certificate for it', () => {
            const cacheDir = newCacheDir();
            const run = runScript([], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: fullBundlePath});

            expect(run.status).toBe(0);
            const generated = parseGeneratedPins(run.stdout);
            for (const {name, pin} of retainedPins()) {
                expect({name, generated: generated.cloudflare.includes(pin)}).toEqual({name, generated: true});
                // Nothing is downloaded, cached or verified for a retained root - the hash is carried forward.
                expect({name, cached: fs.existsSync(path.join(cacheDir, `${name}.pem`))}).toEqual({name, cached: false});
            }
            expect(cachedRoots(cacheDir)).toEqual([...manifestRootNames()].sort());
        });

        it('keeps them in pins.json and every native pin list', () => {
            const pins = readPinsJson();
            for (const {pin} of retainedPins()) {
                expect(Object.keys(pins.roots)).toContain(pin);
                for (const relativePath of nativePinFiles) {
                    const contents = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
                    expect({file: relativePath, pin, present: contents.includes(pin)}).toEqual({file: relativePath, pin, present: true});
                }
            }
        });

        it('leaves them untouched by --refresh', () => {
            const cacheDir = newCacheDir();
            expect(runScript([], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: fullBundlePath}).status).toBe(0);

            const refresh = runScript(['--refresh'], {ROOTS_DIR: cacheDir, ROOTS_BUNDLE: fullBundlePath});
            expect(refresh.status).toBe(0);
            expect(cachedRoots(cacheDir)).toEqual([...manifestRootNames()].sort());
            for (const {pin} of retainedPins()) {
                expect(parseGeneratedPins(refresh.stdout).cloudflare).toContain(pin);
            }
        });
    });

    describe('--verify', () => {
        it('fails when a pinned host cannot be reached instead of silently skipping it', () => {
            const cacheDir = newCacheDir();
            const run = runScript(['--verify'], {
                ROOTS_DIR: cacheDir,
                ROOTS_BUNDLE: fullBundlePath,
                PATH: pathWithNetworkShims(),
            });

            expect(run.status).toBe(1);
            expect(run.stderr).toMatch(/Verification FAILED/);
            expect(run.stdout).not.toMatch(/ OK \(/);
            for (const domain of Object.keys(readPinsJson().domains)) {
                expect(run.stdout).toMatch(new RegExp(`^ {2}${domain.replaceAll('.', '\\.')}\\s+UNREACHABLE`, 'm'));
            }
        });

        it('fails when a retained pin cannot be checked against its published certificate', () => {
            const run = runScript(['--verify'], {ROOTS_DIR: newCacheDir(), ROOTS_BUNDLE: fullBundlePath, PATH: pathWithNetworkShims()});

            expect(run.status).toBe(1);
            for (const {name} of retainedPins()) {
                expect(run.stdout).toMatch(new RegExp(`^ {2}${name}\\s+UNREACHABLE .*pin not verified`, 'm'));
            }
        });

        it('fails when the published certificate for a retained pin is not the pinned one', () => {
            const {trustDir} = makeUnpinnedCa();
            // curl serves a certificate that is not the retained root: the fingerprint check must catch it.
            const run = runScript(['--verify'], {
                ROOTS_DIR: newCacheDir(),
                ROOTS_BUNDLE: fullBundlePath,
                PATH: pathWithNetworkShims({curlServes: path.join(trustDir, 'ca.pem')}),
            });

            expect(run.status).toBe(1);
            for (const {name} of retainedPins()) {
                expect(run.stdout).toMatch(new RegExp(`^ {2}${name}\\s+FAIL \\(certificate at .*fingerprint`, 'm'));
            }
        });

        it('rejects a served chain that anchors at a locally trusted but unpinned CA', () => {
            const {servedChain, trustDir} = makeUnpinnedCa();
            // SSL_CERT_DIR is OpenSSL's default trust directory. Nothing in it is pinned, so every host
            // must FAIL: the roots passed to `openssl verify` have to be the only anchors considered.
            const run = runScript(['--verify'], {
                ROOTS_DIR: newCacheDir(),
                ROOTS_BUNDLE: fullBundlePath,
                SSL_CERT_DIR: trustDir,
                PATH: pathWithNetworkShims({servedChain}),
            });

            expect(run.status).toBe(1);
            expect(run.stdout).not.toMatch(/ OK \(chain anchors/);
            for (const domain of Object.keys(readPinsJson().domains)) {
                expect(run.stdout).toMatch(new RegExp(`^ {2}${domain.replaceAll('.', '\\.')}\\s+FAIL`, 'm'));
            }
        });
    });
});
