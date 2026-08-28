/**
 * Shared between generateGradleDependencyUsage.ts and
 * checkUnusedGradleDependencies.ts.
 *
 * NewDot declares its own Gradle dependencies in android/app/build.gradle,
 * separately from the ones Mobile-Expensify declares for HybridApp, so both
 * repositories need this check.
 */

import fs from 'fs';
import path from 'path';

type PackagesEntry = {usage: 'packages'; packages: string[]};
type ResourcesEntry = {usage: 'resources'; resources: string[]};
type ExemptEntry = {usage: 'exempt'; reason: string; reviewed: string};
type GradleUsageEntry = PackagesEntry | ResourcesEntry | ExemptEntry;
type GradleUsageManifest = Record<string, GradleUsageEntry>;
type SearchContext = {sources: string; resources: string};

const ANDROID_APP_DIR = path.resolve(__dirname, '..', 'android', 'app');
const MANIFEST_PATH = path.join(ANDROID_APP_DIR, 'dependency-usage.json');
const BUILD_GRADLE_PATH = path.join(ANDROID_APP_DIR, 'build.gradle');

const SOURCE_EXTENSIONS = new Set(['.java', '.kt']);
const SKIPPED_DIRECTORIES = new Set(['build', '.gradle', '.git', 'node_modules']);

/**
 * Every `group:artifact` coordinate declared in android/app/build.gradle, on any
 * configuration. Local artifacts — `files(...)`, `project(...)`, and Gradle
 * variables such as `jscFlavor` — are skipped: there is no external declaration
 * to go stale.
 */
function readDeclaredDependencies(): string[] {
    const configuration = '(?:implementation|api|compileOnly|runtimeOnly|kapt|annotationProcessor|[a-zA-Z]+Implementation)';
    const pattern = new RegExp(`^\\s*${configuration}\\s*\\(?\\s*(?:platform\\()?['"]([a-zA-Z0-9_.-]+):([a-zA-Z0-9_.-]+)`, 'gm');
    const coordinates = new Set<string>();
    for (const [, group, artifact] of fs.readFileSync(BUILD_GRADLE_PATH, 'utf8').matchAll(pattern)) {
        coordinates.add(`${group}:${artifact}`);
    }
    return [...coordinates].sort();
}

function readFilesWithExtensions(extensions: Set<string>): string {
    const contents: string[] = [];
    const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
            if (entry.isDirectory()) {
                if (!SKIPPED_DIRECTORIES.has(entry.name)) {
                    walk(path.join(dir, entry.name));
                }
            } else if (extensions.has(path.extname(entry.name))) {
                contents.push(fs.readFileSync(path.join(dir, entry.name), 'utf8'));
            }
        }
    };
    walk(ANDROID_APP_DIR);
    return contents.join('\n');
}

const readSources = () => readFilesWithExtensions(SOURCE_EXTENSIONS);
const readResources = () => readFilesWithExtensions(new Set(['.xml']));

const escapeForRegExp = (value: string) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * How many times the project reaches a dependency, by the route its manifest
 * entry declares: `packages` through Java/Kotlin imports, `resources` through
 * anything in the XML — a view class name in a layout, a style parent, an attr.
 */
function countReferences({sources, resources}: SearchContext, entry: GradleUsageEntry): number {
    if (entry.usage === 'packages') {
        return entry.packages.reduce((total, prefix) => total + (sources.match(new RegExp(`^import\\s+(?:static\\s+)?${escapeForRegExp(prefix)}[.;\\s]`, 'gm'))?.length ?? 0), 0);
    }
    if (entry.usage === 'resources') {
        return entry.resources.reduce((total, name) => total + (resources.match(new RegExp(escapeForRegExp(name), 'g'))?.length ?? 0), 0);
    }
    return 0;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/**
 * A manifest entry is trusted only once its shape is verified; the check reports
 * the human-facing problems (a missing reason, a stale date) separately.
 */
function isGradleUsageEntry(value: unknown): value is GradleUsageEntry {
    if (!isRecord(value)) {
        return false;
    }
    if (value.usage === 'packages') {
        return Array.isArray(value.packages) && value.packages.every((prefix) => typeof prefix === 'string');
    }
    if (value.usage === 'resources') {
        return Array.isArray(value.resources) && value.resources.every((name) => typeof name === 'string');
    }
    if (value.usage === 'exempt') {
        return typeof value.reason === 'string' && typeof value.reviewed === 'string';
    }
    return false;
}

function readManifest(): GradleUsageManifest {
    const parsed: unknown = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    if (!isRecord(parsed)) {
        throw new Error(`${MANIFEST_PATH} must contain a JSON object.`);
    }
    const manifest: GradleUsageManifest = {};
    for (const [coordinate, entry] of Object.entries<unknown>(parsed)) {
        if (!isGradleUsageEntry(entry)) {
            throw new Error(`${coordinate} in ${MANIFEST_PATH} must be a packages, resources or exempt entry.`);
        }
        manifest[coordinate] = entry;
    }
    return manifest;
}

function writeManifest(manifest: GradleUsageManifest) {
    const sorted = Object.fromEntries(
        Object.keys(manifest)
            .sort()
            .map((key) => [key, manifest[key]]),
    );
    fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(sorted, null, 4)}\n`);
}

export type {GradleUsageEntry, GradleUsageManifest, SearchContext};
export {ANDROID_APP_DIR, MANIFEST_PATH, BUILD_GRADLE_PATH, readDeclaredDependencies, readSources, readResources, countReferences, readManifest, writeManifest};
