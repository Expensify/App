#!/usr/bin/env ts-node

/**
 * Fails the install/lint run when a patch-package patch targets the native code of an Expo module
 * that ships as a PRECOMPILED binary and is not opted into building from source.
 *
 * Why this exists: since Expo SDK 53, feature modules (expo-video, expo-location, expo-task-manager,
 * ...) are distributed prebuilt — as `.aar` files on Android (linked via a `publication` block in the
 * module's `expo-module.config.json`, resolved by expo autolinking as a Maven dependency) and as
 * `.xcframework` binaries on iOS. When a module is consumed prebuilt, its source under `node_modules`
 * is NEVER compiled, so a patch-package patch to that source applies to `node_modules` cleanly, the
 * build succeeds, and the patch is SILENTLY IGNORED. This is a documented footgun
 * (https://docs.expo.dev/guides/prebuilt-expo-modules/) with no build-time error.
 *
 * The escape hatch is `expo.autolinking.<platform>.buildFromSource` in package.json: listing the
 * package there forces autolinking to compile it from source instead of pulling the prebuilt binary,
 * which lets the patch take effect. This script cross-references every patch against the precompiled
 * state of the module and the buildFromSource opt-out, and fails loudly on any at-risk patch so the
 * dev finds out at `npm install` / CI time rather than by debugging a no-op patch on device.
 *
 * iOS is resolved per PRODUCT, not per package: a module's `spm.config.json` splits its source into
 * products (each its own pod + `.xcframework`), some of which may be `sourceOnly` (never prebuilt, so
 * a patch to them still applies). We map each patched iOS file to its product and only flag files that
 * land in a non-sourceOnly product with an actual prebuilt binary.
 */
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..');
/**
 * Escape hatch for false positives. Detection is static, so it cannot see Expo's runtime
 * `shouldUsePublicationScript` decision — a module with a `publication` block can still build from
 * source (e.g. on a React Native version the prebuilt artifact is incompatible with), in which case
 * the patch DOES apply and the guard would nag wrongly. A dev who has verified a patch applies can
 * list the patch's path relative to `patches/` here (one path per line, `#` comments allowed) to
 * suppress the check for that specific patch.
 */
type Platform = 'android' | 'ios';

type ExpoModuleConfig = {
    android?: {publication?: unknown};
    apple?: unknown;
    ios?: unknown;
};

type AutolinkingConfig = {
    exclude?: string[];
    buildFromSource?: string[];
    android?: {exclude?: string[]; buildFromSource?: string[]};
    ios?: {exclude?: string[]; buildFromSource?: string[]};
    apple?: {exclude?: string[]; buildFromSource?: string[]};
};

type PackageJSON = {
    expo?: {autolinking?: AutolinkingConfig};
};

/** Minimal shape of an `spm.config.json` (only the fields we consume). */
type SpmTarget = {path?: string; pattern?: string; headerPattern?: string; exclude?: string[]};
type SpmProduct = {name?: string; podName?: string; sourceOnly?: boolean; targets?: SpmTarget[]};
type SpmConfig = {products?: SpmProduct[]};

type Violation = {
    patch: string;
    pkg: string;
    platform: Platform;
    reason: string;
};

/** Read the `expo.autolinking` config from the root package.json. */
function readAutolinkingConfig(rootDir: string): AutolinkingConfig {
    const pkgJson = readJsonIfExists<PackageJSON>(path.join(rootDir, 'package.json')) ?? {};
    return pkgJson.expo?.autolinking ?? {};
}

/** Recursively collect every `*.patch` file under `patches/`. */
function collectPatchFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...collectPatchFiles(full));
        } else if (entry.isFile() && entry.name.endsWith('.patch')) {
            out.push(full);
        }
    }
    return out;
}

function getPlatformFromSegments(segments: string[]): Platform | undefined {
    if (segments.includes('android')) {
        return 'android';
    }
    if (segments.includes('ios') || segments.includes('apple')) {
        return 'ios';
    }
    return undefined;
}

/**
 * Extract, per package, the set of package-relative paths a patch touches (the part after
 * `node_modules/<pkg>/`), read out of the diff headers.
 */
function analyzePatch(patchPath: string): Map<string, Set<string>> {
    const content = fs.readFileSync(patchPath, 'utf8');
    const result = new Map<string, Set<string>>();
    // Matches both `diff --git a/node_modules/<path>` and `+++ b/node_modules/<path>` headers.
    const pathRegex = /(?:^|\s)[ab]\/node_modules\/(.+)$/gm;
    for (const match of content.matchAll(pathRegex)) {
        const relPath = match[1].trim();
        const segments = relPath.split('/');
        // Scoped packages (`@scope/name`) occupy two path segments.
        const scoped = segments.at(0)?.startsWith('@');
        const pkg = scoped ? `${segments.at(0)}/${segments.at(1)}` : segments.at(0);
        if (!pkg) {
            continue;
        }
        const relUnderPkg = segments.slice(scoped ? 2 : 1).join('/');
        if (!result.has(pkg)) {
            result.set(pkg, new Set());
        }
        result.get(pkg)?.add(relUnderPkg);
    }
    return result;
}

/** Read a module's `expo-module.config.json`, or null if the package is not an Expo module. */
function readExpoModuleConfig(pkg: string, nodeModulesDir: string): ExpoModuleConfig | null {
    return readJsonIfExists<ExpoModuleConfig>(path.join(nodeModulesDir, pkg, 'expo-module.config.json'));
}

/** The module's own `spm.config.json` (internal Expo module), or null. */
function readInternalSpmConfig(pkg: string, nodeModulesDir: string): SpmConfig | null {
    return readJsonIfExists<SpmConfig>(path.join(nodeModulesDir, pkg, 'spm.config.json'));
}

/** The `spm.config.json` autolinking bundles for a third-party pod, or null. */
function readExternalSpmConfig(pkg: string, externalConfigsDir: string): SpmConfig | null {
    return readJsonIfExists<SpmConfig>(path.join(externalConfigsDir, pkg, 'spm.config.json'));
}

function readJsonIfExists<T>(filePath: string): T | null {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Config files are controlled by the repository or installed packages; validating every unused field would add no safety here.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return parsed as T;
}

/** Whether a third-party pod is registered for iOS prebuilt via autolinking's bundled external-configs. */
function isExternalPrebuiltPod(pkg: string, externalConfigsDir: string): boolean {
    return fs.existsSync(path.join(externalConfigsDir, pkg, 'spm.config.json'));
}

/**
 * Compile the subset of glob syntax `spm.config.json` target patterns use (`**`, `*`, `?`, `{a,b}`)
 * to an anchored RegExp. `**` matches across `/`; a single `*` does not.
 */
function globToRegExp(glob: string): RegExp {
    let re = '';
    for (let i = 0; i < glob.length; i++) {
        const c = glob[i];
        if (c === '*') {
            if (glob[i + 1] === '*') {
                re += '.*';
                i++;
                // Consume a trailing slash so `**/` also matches zero directories.
                if (glob[i + 1] === '/') {
                    i++;
                }
            } else {
                re += '[^/]*';
            }
        } else if (c === '?') {
            re += '[^/]';
        } else if (c === '{') {
            re += '(?:';
        } else if (c === '}') {
            re += ')';
        } else if (c === ',') {
            re += '|';
        } else if ('.+^$()[]|\\/'.includes(c)) {
            re += `\\${c}`;
        } else {
            re += c;
        }
    }
    return new RegExp(`^${re}$`);
}

/** Whether an `spm.config.json` product's targets claim `rel` (a package-relative path). */
function productClaimsFile(product: SpmProduct, rel: string): boolean {
    for (const target of product.targets ?? []) {
        const base = target.path ? `${target.path.replace(/\/+$/, '')}/` : '';
        if (base && rel !== target.path && !rel.startsWith(base)) {
            continue;
        }
        const sub = base ? rel.slice(base.length) : rel;
        const patterns = [target.pattern, target.headerPattern].filter((p): p is string => !!p);
        if (patterns.length > 0 && !patterns.some((p) => globToRegExp(p).test(sub))) {
            continue;
        }
        if ((target.exclude ?? []).some((e) => globToRegExp(e).test(sub))) {
            continue;
        }
        return true;
    }
    return false;
}

/** Whether `<productName>.tar.gz` is bundled under the package's `prebuilds/output` (bounded recursion). */
function productTarballExists(pkg: string, productName: string, nodeModulesDir: string): boolean {
    return hasTarballUnder(path.join(nodeModulesDir, pkg, 'prebuilds', 'output'), (f) => f === `${productName}.tar.gz`);
}

/** Whether any bundled `*.tar.gz` exists under the package's `prebuilds/output` (coarse fallback). */
function shipsPrebuiltXcframework(pkg: string, nodeModulesDir: string): boolean {
    return hasTarballUnder(path.join(nodeModulesDir, pkg, 'prebuilds', 'output'), (f) => f.endsWith('.tar.gz'));
}

/** Whether a `.tar.gz` matching `match` lives inside an `xcframeworks/` dir anywhere under `dir`. */
function hasTarballUnder(dir: string, match: (file: string) => boolean, depth = 0): boolean {
    if (depth > 6 || !fs.existsSync(dir)) {
        return false;
    }
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        if (!entry.isDirectory()) {
            continue;
        }
        if (entry.name === 'xcframeworks') {
            if (fs.readdirSync(path.join(dir, entry.name)).some(match)) {
                return true;
            }
        } else if (hasTarballUnder(path.join(dir, entry.name), match, depth + 1)) {
            return true;
        }
    }
    return false;
}

/**
 * The name of the prebuilt iOS product that would replace `rel` at build time, or null if `rel` still
 * compiles from source (so a patch to it applies).
 *
 * iOS prebuilt state is resolved per product from `spm.config.json`, mirroring
 * `resolve_own_prebuilt_info` in `expo-modules-autolinking/scripts/ios/precompiled_modules.rb`. A file
 * is prebuilt-replaced iff a non-`sourceOnly` product claims it AND that product has a binary: for an
 * internal module the `<Product>.tar.gz` must be bundled on disk; for a third-party pod the binary is
 * downloaded remotely, so registry membership suffices. `sourceOnly` products (e.g. expo-modules-core's
 * `ExpoModulesWorkletsAdapter`) and files outside every product are left source-compiled.
 */
function iosPrebuiltProduct(pkg: string, rel: string, nodeModulesDir: string, externalConfigsDir: string): string | null {
    const internalSpm = readInternalSpmConfig(pkg, nodeModulesDir);
    const isExternal = !internalSpm && isExternalPrebuiltPod(pkg, externalConfigsDir);
    const spm = internalSpm ?? readExternalSpmConfig(pkg, externalConfigsDir);
    if (spm) {
        for (const product of spm.products ?? []) {
            if (product.sourceOnly || !productClaimsFile(product, rel)) {
                continue;
            }
            const name = product.name ?? product.podName;
            if (name && (isExternal || productTarballExists(pkg, name, nodeModulesDir))) {
                return name;
            }
        }
        return null;
    }
    // No spm.config.json but a binary is nonetheless present/registered — flag the whole package.
    if (isExternalPrebuiltPod(pkg, externalConfigsDir) || shipsPrebuiltXcframework(pkg, nodeModulesDir)) {
        return pkg;
    }
    return null;
}

/** All iOS pod/product names declared for `pkg` (internal or external spm.config.json). */
function iosPodNames(pkg: string, nodeModulesDir: string, externalConfigsDir: string): string[] {
    const spm = readInternalSpmConfig(pkg, nodeModulesDir) ?? readExternalSpmConfig(pkg, externalConfigsDir);
    const names = new Set<string>();
    for (const product of spm?.products ?? []) {
        if (product.name) {
            names.add(product.name);
        }
        if (product.podName) {
            names.add(product.podName);
        }
    }
    return [...names];
}

/**
 * Whether `pkg` is opted into building from source for `platform` (buildFromSource entries are regexes, full-match).
 *
 * Precedence mirrors expo-modules-autolinking `parsePackageJsonOptions`: the platform block overrides
 * the root-level list, and for iOS `apple` is the platform with `ios` as a legacy fallback used only
 * when the `apple` key is absent. A platform block that omits `buildFromSource` falls through to root.
 * Matching mirrors Ruby `build_from_source?`, which tests each pattern against BOTH the npm package name
 * and the pod/product name(s) — so an opt-out listed by pod name (e.g. `ExpoModulesCore`) is honored.
 */
function isBuiltFromSource(pkg: string, platform: Platform, config: AutolinkingConfig, nodeModulesDir: string, externalConfigsDir: string): boolean {
    const platformBlock = platform === 'android' ? config.android : (config.apple ?? config.ios);
    const list = platformBlock?.buildFromSource ?? config.buildFromSource ?? [];
    if (list.length === 0) {
        return false;
    }
    const names = platform === 'ios' ? [pkg, ...iosPodNames(pkg, nodeModulesDir, externalConfigsDir)] : [pkg];
    return list.some((entry) => {
        const re = new RegExp(`^(?:${entry})$`);
        return names.some((name) => re.test(name));
    });
}

/**
 * Whether `pkg` is excluded from autolinking for `platform`.
 *
 * Platform precedence mirrors Expo's `parsePackageJsonOptions`: the platform-specific list replaces
 * the root list, and for iOS `apple` takes precedence over the legacy `ios` block when present.
 */
function isExcluded(pkg: string, platform: Platform, config: AutolinkingConfig): boolean {
    const platformBlock = platform === 'android' ? config.android : (config.apple ?? config.ios);
    return (platformBlock?.exclude ?? config.exclude ?? []).includes(pkg);
}

/** Read the suppression list: patch paths relative to `patches/`, one per line, `#` starts a comment. */
function readIgnoreList(ignoreFile: string): Set<string> {
    if (!fs.existsSync(ignoreFile)) {
        return new Set();
    }
    const names = fs
        .readFileSync(ignoreFile, 'utf8')
        .split('\n')
        .map((line) => line.replace(/#.*$/, '').trim())
        .filter((line) => line.length > 0);
    return new Set(names);
}

/** The buildFromSource key Expo will actually honor for `platform` (apple suppresses ios when present). */
function recommendedBuildFromSourceKey(platform: Platform, config: AutolinkingConfig): string {
    if (platform === 'android') {
        return 'android';
    }
    return config.apple ? 'apple' : 'ios';
}

function main(rootDir = projectRoot): void {
    const patchesDir = path.join(rootDir, 'patches');
    const nodeModulesDir = path.join(rootDir, 'node_modules');
    // Third-party pods are registered for iOS prebuilt via spm.config.json files bundled INSIDE
    // expo-modules-autolinking (scan_external_configs), not via their own expo-module.config.json.
    const externalConfigsDir = path.join(nodeModulesDir, 'expo-modules-autolinking', 'external-configs', 'ios');
    const ignoreFile = path.join(patchesDir, '.expo-patch-ignore');
    const autolinking = readAutolinkingConfig(rootDir);
    const ignored = readIgnoreList(ignoreFile);
    const patchFiles = collectPatchFiles(patchesDir);
    const violations: Violation[] = [];

    for (const patchPath of patchFiles) {
        const patchRelativePath = path.relative(patchesDir, patchPath);
        if (ignored.has(patchRelativePath)) {
            // Explicitly suppressed in patches/.expo-patch-ignore (dev verified this specific patch applies).
            continue;
        }
        const touched = analyzePatch(patchPath);
        for (const [pkg, relPaths] of touched) {
            const config = readExpoModuleConfig(pkg, nodeModulesDir);

            // Android: coarse per-package signal — the module ships a prebuilt Maven AAR (publication block).
            const touchesAndroid = [...relPaths].some((rel) => getPlatformFromSegments(rel.split('/')) === 'android');
            if (
                touchesAndroid &&
                !isExcluded(pkg, 'android', autolinking) &&
                config?.android?.publication != null &&
                !isBuiltFromSource(pkg, 'android', autolinking, nodeModulesDir, externalConfigsDir)
            ) {
                violations.push({
                    patch: path.relative(rootDir, patchPath),
                    pkg,
                    platform: 'android',
                    reason: 'android ships a precompiled binary (publication AAR); patch to its source will be silently ignored at build time',
                });
            }

            // iOS: per-product resolution — flag only files a prebuilt (non-sourceOnly) product would replace.
            const iosProducts = new Set<string>();
            for (const rel of relPaths) {
                if (getPlatformFromSegments(rel.split('/')) !== 'ios') {
                    continue;
                }
                const product = iosPrebuiltProduct(pkg, rel, nodeModulesDir, externalConfigsDir);
                if (product) {
                    iosProducts.add(product);
                }
            }
            if (iosProducts.size > 0 && !isExcluded(pkg, 'ios', autolinking) && !isBuiltFromSource(pkg, 'ios', autolinking, nodeModulesDir, externalConfigsDir)) {
                violations.push({
                    patch: path.relative(rootDir, patchPath),
                    pkg,
                    platform: 'ios',
                    reason: `ios ships a precompiled binary for product(s) ${[...iosProducts].join(', ')}; patch to their source will be silently ignored at build time`,
                });
            }
        }
    }

    if (violations.length === 0) {
        console.log('✓ verifyExpoPatches: no patches target a precompiled Expo module without a buildFromSource opt-out');
        if (ignored.size > 0) {
            console.log(`  Ignored patches: ${[...ignored].join(', ')}`);
        }
        return;
    }

    console.error('\n✖ verifyExpoPatches: found patch(es) that will be SILENTLY IGNORED because the module is precompiled:\n');
    for (const v of violations) {
        const key = recommendedBuildFromSourceKey(v.platform, autolinking);
        console.error(`  ${v.patch}`);
        console.error(`    ${v.pkg} — ${v.reason}`);
        console.error(`    Fix: add "${v.pkg}" to expo.autolinking.${key}.buildFromSource in package.json`);
        console.error(`    Or, if you have verified the patch DOES apply, add "${path.relative(patchesDir, path.join(rootDir, v.patch))}" to patches/.expo-patch-ignore\n`);
    }
    console.error('See https://docs.expo.dev/guides/prebuilt-expo-modules/ for background.');
    process.exit(1);
}

if (require.main === module) {
    main();
}

export default main;
