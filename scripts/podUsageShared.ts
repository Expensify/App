/**
 * Shared between generatePodUsage.ts and checkUnusedPods.ts.
 *
 * NewDot declares its own pods in ios/Podfile, separately from the ones
 * Mobile-Expensify declares for HybridApp, so both repositories need this check.
 *
 * Known limitation, deliberately not covered: the manifest is keyed by pod name
 * alone, with no target dimension, and the sources are read as one corpus. A pod
 * declared for one target is therefore proved by an import from another. Fixing
 * that means resolving Podfile targets against Xcode target membership, which
 * this check does not attempt.
 */

import fs from 'fs';
import path from 'path';

import {stripComments} from './nativeSourceComments';

type ModuleEntry = {usage: 'module'; module: string};
type HeadersEntry = {usage: 'headers'; headers: string[]};
type ExemptEntry = {usage: 'exempt'; reason: string; reviewed: string};
type PodUsageEntry = ModuleEntry | HeadersEntry | ExemptEntry;
type PodUsageManifest = Record<string, PodUsageEntry>;

const IOS_DIR = path.resolve(__dirname, '..', 'ios');
const MANIFEST_PATH = path.join(IOS_DIR, 'pod-usage.json');
const PODFILE_PATH = path.join(IOS_DIR, 'Podfile');

const SOURCE_EXTENSIONS = new Set(['.swift', '.m', '.mm', '.h', '.pch', '.c', '.cpp', '.cc', '.hpp']);
const SKIPPED_DIRECTORIES = new Set(['Pods', 'build', 'DerivedData', '.git', 'node_modules']);

const POD_DECLARATION = /^\s*pod\s+['"]([^'"]+)['"]/;

const readPodfile = () => stripComments(fs.readFileSync(PODFILE_PATH, 'utf8'), 'ruby');

/**
 * Pod names as declared in the Podfile, deduplicated to the pod itself:
 * `pod 'MaterialComponents/Tabs'` is one declaration of MaterialComponents.
 */
function readDeclaredPods(): string[] {
    const pods = new Set<string>();
    for (const line of readPodfile().split('\n')) {
        const match = POD_DECLARATION.exec(line);
        if (match) {
            const [pod] = (match.at(1) ?? '').split('/');
            pods.add(pod);
        }
    }
    return [...pods].sort();
}

/**
 * Lines that declare a pod in a form this parser cannot read, so that a Podfile
 * refactor fails the check loudly instead of quietly shrinking the set of pods
 * it verifies.
 */
function findUnparsedPodDeclarations(): string[] {
    const unparsed: string[] = [];
    for (const [index, line] of readPodfile().split('\n').entries()) {
        if (/^\s*pod\b/.test(line) && !POD_DECLARATION.test(line)) {
            unparsed.push(`ios/Podfile:${index + 1}: ${line.trim()}`);
        }
    }
    return unparsed;
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
                contents.push(stripComments(fs.readFileSync(path.join(dir, entry.name), 'utf8'), 'c'));
            }
        }
    };
    walk(IOS_DIR);
    return contents.join('\n');
}

const escapeForRegExp = (value: string) => value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * How many times the sources reach a pod, by the route its manifest entry
 * declares. Every pattern is anchored to the start of a line: an import is the
 * first thing on its line, and anchoring is what stops a mention inside a string
 * or a trailing note from counting as a reference.
 */
function countReferences(sources: string, entry: PodUsageEntry): number {
    const patterns: RegExp[] = [];
    if (entry.usage === 'module') {
        const module = escapeForRegExp(entry.module);
        patterns.push(new RegExp(`^\\s*import\\s+${module}\\b`, 'gm'), new RegExp(`^\\s*@import\\s+${module}\\b`, 'gm'), new RegExp(`^\\s*#import\\s*<${module}/`, 'gm'));
    } else if (entry.usage === 'headers') {
        for (const header of entry.headers) {
            // Both `#import "Header.h"` and the canonical framework form
            // `#import <Pod/Header.h>` reach the same header.
            patterns.push(new RegExp(`^\\s*#import\\s*["<](?:[\\w.+-]+/)?${escapeForRegExp(header)}[">]`, 'gm'));
        }
    }
    return patterns.reduce((total, pattern) => total + (sources.match(pattern)?.length ?? 0), 0);
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/**
 * A manifest entry is trusted only once its shape is verified; the check reports
 * the human-facing problems (a missing reason, an unusable date) separately.
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
export {IOS_DIR, MANIFEST_PATH, PODFILE_PATH, readDeclaredPods, findUnparsedPodDeclarations, readSources, countReferences, readManifest, writeManifest};
