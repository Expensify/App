/**
 * Shared between generateGradleDependencyUsage.ts and
 * checkUnusedGradleDependencies.ts.
 *
 * NewDot declares its own Gradle dependencies in android/app/build.gradle,
 * separately from the ones Mobile-Expensify declares for HybridApp, so both
 * repositories need this check.
 *
 * Two limitations, both deliberate:
 *
 * - `buildscript { classpath ... }` coordinates are out of scope. They are Gradle
 *   plugins, reached through `apply plugin:` and the `plugins` block rather than
 *   through an import, so neither route this check knows about can verify them.
 * - The manifest is keyed by `group:artifact` with no configuration or source-set
 *   dimension, and the sources are read as one corpus. The same coordinate
 *   declared on two configurations collapses to one entry, and a coordinate is
 *   proved by an import from any source set.
 */

import fs from 'fs';
import path from 'path';

import {stripComments} from './nativeSourceComments';

type PackagesEntry = {usage: 'packages'; packages: string[]};
type ResourcesEntry = {usage: 'resources'; resources: string[]};
type ExemptEntry = {usage: 'exempt'; reason: string; reviewed: string};
type GradleUsageEntry = PackagesEntry | ResourcesEntry | ExemptEntry;
type GradleUsageManifest = Record<string, GradleUsageEntry>;
type SearchContext = {sources: string; resources: string};

const ANDROID_APP_DIR = path.resolve(__dirname, '..', 'android', 'app');
const MANIFEST_PATH = path.join(ANDROID_APP_DIR, 'dependency-usage.json');
const BUILD_GRADLE_PATH = path.join(ANDROID_APP_DIR, 'build.gradle');
const RELATIVE_BUILD_GRADLE = 'android/app/build.gradle';

const SOURCE_EXTENSIONS = new Set(['.java', '.kt']);
const SKIPPED_DIRECTORIES = new Set(['build', '.gradle', '.git', 'node_modules']);

/**
 * Gradle names a configuration either on its own (`implementation`), prefixed by
 * a source set or variant (`testImplementation`, `debugCompileOnly`), or suffixed
 * for the annotation processors (`kaptTest`). All three forms declare a
 * dependency that can go stale, so all three have to be read.
 */
const BASE_CONFIGURATIONS = [
    'implementation',
    'api',
    'compileOnlyApi',
    'compileOnly',
    'runtimeOnly',
    'annotationProcessor',
    'kapt',
    'ksp',
    'detektPlugins',
    'coreLibraryDesugaring',
    'lintChecks',
    'lintPublish',
];
const SUFFIX_CONFIGURATIONS = ['Implementation', 'Api', 'CompileOnlyApi', 'CompileOnly', 'RuntimeOnly', 'AnnotationProcessor', 'Kapt', 'Ksp', 'DetektPlugins'];
const CONFIGURATION = `(?:${BASE_CONFIGURATIONS.join('|')}|[a-zA-Z0-9]+(?:${SUFFIX_CONFIGURATIONS.join('|')})|(?:kapt|ksp)[A-Z][a-zA-Z0-9]*)`;
const CONFIGURATION_NAME = new RegExp(`^${CONFIGURATION}$`);

/**
 * Configurations that name something other than an external module dependency,
 * and so are neither parsed nor reported as unreadable.
 */
const IGNORED_CONFIGURATIONS = new Set(['classpath']);

/**
 * `implementation project(':x')`, `implementation files(...)`: built from this
 * repository or checked in, so there is no external declaration to go stale.
 */
const LOCAL_ARTIFACT = /^\(?\s*(?:project|files|fileTree|gradleApi|localGroovy)\s*\(/;

/**
 * `implementation jscFlavor`: a Gradle variable resolved elsewhere in the build,
 * whose value the manifest cannot key on.
 */
const GRADLE_VARIABLE = /^\(?\s*[A-Za-z_][A-Za-z0-9_]*\s*\)?$/;

/**
 * `implementation "group:artifact:version"`, with the optional wrappers Gradle
 * accepts around it. `\s*` spans newlines, so the coordinate may sit on its own
 * line below the configuration.
 */
const STRING_DECLARATION = new RegExp(`^[ \\t]*${CONFIGURATION}\\s*\\(?\\s*(?:(?:platform|enforcedPlatform)\\s*\\()?\\s*['"]([a-zA-Z0-9_.-]+):([a-zA-Z0-9_.-]+)`, 'gm');

/**
 * `implementation group: 'g', name: 'a', version: 'v'`.
 */
const MAP_DECLARATION = new RegExp(`^[ \\t]*${CONFIGURATION}\\s*\\(?\\s*group\\s*:\\s*['"]([a-zA-Z0-9_.-]+)['"]\\s*,\\s*name\\s*:\\s*['"]([a-zA-Z0-9_.-]+)['"]`, 'gm');

const readBuildGradle = () => stripComments(fs.readFileSync(BUILD_GRADLE_PATH, 'utf8'), 'c');

/**
 * Character offsets in `text` where a declaration pattern started matching,
 * used to tell a line the parser read from one it skipped.
 */
function collectDeclarations(text: string): {coordinates: Set<string>; matchedOffsets: Set<number>} {
    const coordinates = new Set<string>();
    const matchedOffsets = new Set<number>();
    for (const pattern of [STRING_DECLARATION, MAP_DECLARATION]) {
        for (const match of text.matchAll(pattern)) {
            coordinates.add(`${match.at(1)}:${match.at(2)}`);
            matchedOffsets.add(match.index ?? 0);
        }
    }
    return {coordinates, matchedOffsets};
}

/**
 * Every `group:artifact` coordinate declared in android/app/build.gradle on a
 * dependency configuration. Local artifacts (`files(...)`, `project(...)`, and
 * Gradle variables such as `jscFlavor`) are skipped: there is no external
 * declaration to go stale.
 */
function readDeclaredDependencies(): string[] {
    return [...collectDeclarations(readBuildGradle()).coordinates].sort();
}

/**
 * Lines that declare a dependency in a form this parser cannot read: a version
 * catalog accessor, an interpolated coordinate, anything new. Without this the
 * parser would drop them silently and the check would report success over
 * whatever subset it still understood, which is how a version-catalog migration
 * turns the whole gate into a no-op.
 */
function findUnparsedDeclarations(): string[] {
    const text = readBuildGradle();
    const {matchedOffsets} = collectDeclarations(text);

    const matchedLines = new Set<number>();
    for (const offset of matchedOffsets) {
        matchedLines.add(text.slice(0, offset).split('\n').length - 1);
    }

    const unparsed: string[] = [];
    for (const [index, line] of text.split('\n').entries()) {
        const match = /^[ \t]*([A-Za-z][A-Za-z0-9]*)\b(.*)$/.exec(line);
        const configuration = match?.at(1);
        const argument = (match?.at(2) ?? '').trim();
        const readable = matchedLines.has(index) || LOCAL_ARTIFACT.test(argument) || GRADLE_VARIABLE.test(argument);
        if (configuration && !IGNORED_CONFIGURATIONS.has(configuration) && CONFIGURATION_NAME.test(configuration) && !readable) {
            unparsed.push(`${RELATIVE_BUILD_GRADLE}:${index + 1}: ${line.trim()}`);
        }
    }
    return unparsed;
}

function readFilesWithExtensions(extensions: Set<string>, flavor: 'c' | 'xml'): string {
    const contents: string[] = [];
    const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
            if (entry.isDirectory()) {
                if (!SKIPPED_DIRECTORIES.has(entry.name)) {
                    walk(path.join(dir, entry.name));
                }
            } else if (extensions.has(path.extname(entry.name))) {
                contents.push(stripComments(fs.readFileSync(path.join(dir, entry.name), 'utf8'), flavor));
            }
        }
    };
    walk(ANDROID_APP_DIR);
    return contents.join('\n');
}

const readSources = () => readFilesWithExtensions(SOURCE_EXTENSIONS, 'c');
const readResources = () => readFilesWithExtensions(new Set(['.xml']), 'xml');

const escapeForRegExp = (value: string) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * How many times the project reaches a dependency, by the route its manifest
 * entry declares: `packages` through Java and Kotlin imports, `resources`
 * through anything in the XML — a view class name in a layout, a style parent,
 * an attr. The `resources` match is bounded on both sides so that a name cannot
 * be satisfied by being the tail of a longer, unrelated one.
 */
function countReferences({sources, resources}: SearchContext, entry: GradleUsageEntry): number {
    if (entry.usage === 'packages') {
        return entry.packages.reduce((total, prefix) => total + (sources.match(new RegExp(`^import\\s+(?:static\\s+)?${escapeForRegExp(prefix)}[.;\\s]`, 'gm'))?.length ?? 0), 0);
    }
    if (entry.usage === 'resources') {
        return entry.resources.reduce((total, name) => total + (resources.match(new RegExp(`(?<![\\w.$])${escapeForRegExp(name)}(?![\\w$])`, 'g'))?.length ?? 0), 0);
    }
    return 0;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/**
 * A manifest entry is trusted only once its shape is verified; the check reports
 * the human-facing problems (a missing reason, an unusable date) separately.
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
export {
    ANDROID_APP_DIR,
    MANIFEST_PATH,
    BUILD_GRADLE_PATH,
    RELATIVE_BUILD_GRADLE,
    readDeclaredDependencies,
    findUnparsedDeclarations,
    readSources,
    readResources,
    countReferences,
    readManifest,
    writeManifest,
};
