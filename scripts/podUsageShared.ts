/**
 * Shared between generatePodUsage.ts and checkUnusedPods.ts.
 *
 * NewDot declares its own pods in ios/Podfile, separately from the ones
 * Mobile-Expensify declares for HybridApp, so both repositories need this check.
 */

import fs from 'fs';
import path from 'path';

type ModuleEntry = {usage: 'module'; module: string};
type HeadersEntry = {usage: 'headers'; headers: string[]};
type ExemptEntry = {usage: 'exempt'; reason: string; reviewed: string};
type PodUsageEntry = ModuleEntry | HeadersEntry | ExemptEntry;
type PodUsageManifest = Record<string, PodUsageEntry>;

const IOS_DIR = path.resolve(__dirname, '..', 'ios');
const MANIFEST_PATH = path.join(IOS_DIR, 'pod-usage.json');
const PODFILE_PATH = path.join(IOS_DIR, 'Podfile');

const SOURCE_EXTENSIONS = new Set(['.swift', '.m', '.mm', '.h', '.pch']);
const SKIPPED_DIRECTORIES = new Set(['Pods', 'build', 'DerivedData', '.git', 'node_modules']);

/**
 * Pod names as declared in the Podfile, deduplicated to the pod itself:
 * `pod 'MaterialComponents/Tabs'` is one declaration of MaterialComponents.
 */
function readDeclaredPods(): string[] {
    const pods = new Set<string>();
    for (const line of fs.readFileSync(PODFILE_PATH, 'utf8').split('\n')) {
        const match = /^\s*pod\s+['"]([^'"]+)['"]/.exec(line);
        if (match) {
            const [pod] = (match.at(1) ?? '').split('/');
            pods.add(pod);
        }
    }
    return [...pods].sort();
}

function readSources(): string {
    const contents: string[] = [];
    const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
            if (entry.isDirectory()) {
                if (!SKIPPED_DIRECTORIES.has(entry.name)) {
                    walk(path.join(dir, entry.name));
                }
            } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
                contents.push(fs.readFileSync(path.join(dir, entry.name), 'utf8'));
            }
        }
    };
    walk(IOS_DIR);
    return contents.join('\n');
}

const escapeForRegExp = (value: string) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * How many times the sources reach a pod, by the route its manifest entry declares.
 */
function countReferences(sources: string, entry: PodUsageEntry): number {
    const patterns: RegExp[] = [];
    if (entry.usage === 'module') {
        const module = escapeForRegExp(entry.module);
        patterns.push(new RegExp(`^\\s*import\\s+${module}\\b`, 'gm'), new RegExp(`@import\\s+${module}\\b`, 'g'), new RegExp(`#import\\s*<${module}/`, 'g'));
    } else if (entry.usage === 'headers') {
        for (const header of entry.headers) {
            patterns.push(new RegExp(`#import\\s*["<]${escapeForRegExp(header)}[">]`, 'g'));
        }
    }
    return patterns.reduce((total, pattern) => total + (sources.match(pattern)?.length ?? 0), 0);
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/**
 * A manifest entry is trusted only once its shape is verified; the check reports
 * the human-facing problems (a missing reason, a stale date) separately.
 */
function isPodUsageEntry(value: unknown): value is PodUsageEntry {
    if (!isRecord(value)) {
        return false;
    }
    if (value.usage === 'module') {
        return typeof value.module === 'string';
    }
    if (value.usage === 'headers') {
        return Array.isArray(value.headers) && value.headers.every((header) => typeof header === 'string');
    }
    if (value.usage === 'exempt') {
        return typeof value.reason === 'string' && typeof value.reviewed === 'string';
    }
    return false;
}

function readManifest(): PodUsageManifest {
    const parsed: unknown = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    if (!isRecord(parsed)) {
        throw new Error(`${MANIFEST_PATH} must contain a JSON object.`);
    }
    const manifest: PodUsageManifest = {};
    for (const [pod, entry] of Object.entries<unknown>(parsed)) {
        if (!isPodUsageEntry(entry)) {
            throw new Error(`${pod} in ${MANIFEST_PATH} must be a module, headers or exempt entry.`);
        }
        manifest[pod] = entry;
    }
    return manifest;
}

function writeManifest(manifest: PodUsageManifest) {
    const sorted = Object.fromEntries(
        Object.keys(manifest)
            .sort()
            .map((key) => [key, manifest[key]]),
    );
    fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(sorted, null, 4)}\n`);
}

export type {PodUsageEntry, PodUsageManifest};
export {IOS_DIR, MANIFEST_PATH, PODFILE_PATH, readDeclaredPods, readSources, countReferences, readManifest, writeManifest};
