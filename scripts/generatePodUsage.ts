#!/usr/bin/env bun
/**
 * Regenerates ios/pod-usage.json from the installed Pods directory.
 *
 * checkUnusedPods.ts cannot resolve a pod's module name on its own: the name a
 * pod is imported under is decided by its podspec, not by its Podfile entry
 * (GzipSwift exports a module called Gzip), and Objective-C pods that ship no
 * module are reachable only through their public headers. Both live under
 * ios/Pods, which is gitignored, so they are resolved here once and committed to
 * the manifest.
 *
 * Run this after `pod install` whenever the Podfile changes, then review the
 * diff — a pod this script cannot find any reference for is written out as
 * `exempt` with an empty reason, which the check rejects until you fill it in.
 *
 * Usage: npx bun scripts/generatePodUsage.ts
 */

import fs from 'fs';
import path from 'path';

import type {PodUsageManifest} from './podUsageShared';

import {IOS_DIR, MANIFEST_PATH, countReferences, readDeclaredPods, readManifest, readSources, writeManifest} from './podUsageShared';

const TARGET_SUPPORT_FILES = path.join(IOS_DIR, 'Pods', 'Target Support Files');
const PUBLIC_HEADERS = path.join(IOS_DIR, 'Pods', 'Headers', 'Public');

function readModuleName(pod: string): string | undefined {
    const dir = path.join(TARGET_SUPPORT_FILES, pod);
    if (!fs.existsSync(dir)) {
        return undefined;
    }
    for (const entry of fs.readdirSync(dir)) {
        if (!entry.endsWith('.modulemap')) {
            continue;
        }
        const match = /^\s*(?:framework\s+)?module\s+([A-Za-z0-9_]+)/m.exec(fs.readFileSync(path.join(dir, entry), 'utf8'));
        if (match) {
            return match[1];
        }
    }
    return undefined;
}

function readPublicHeaders(pod: string): string[] {
    const dir = path.join(PUBLIC_HEADERS, pod);
    if (!fs.existsSync(dir)) {
        return [];
    }
    const out: string[] = [];
    const walk = (current: string) => {
        for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (entry.name.endsWith('.h')) {
                out.push(entry.name);
            }
        }
    };
    walk(dir);
    return out.sort();
}

function main() {
    if (!fs.existsSync(TARGET_SUPPORT_FILES)) {
        console.error(`${TARGET_SUPPORT_FILES} is missing. Run \`bundle exec pod install\` in ios/ first.`);
        process.exit(1);
    }

    const sources = readSources();
    const previous: PodUsageManifest = fs.existsSync(MANIFEST_PATH) ? readManifest() : {};
    const manifest: PodUsageManifest = {};

    for (const pod of readDeclaredPods()) {
        const moduleName = readModuleName(pod) ?? pod.replaceAll(/[^A-Za-z0-9_]/g, '_');
        if (countReferences(sources, {usage: 'module', module: moduleName}) > 0) {
            manifest[pod] = {usage: 'module', module: moduleName};
            continue;
        }

        const headers = readPublicHeaders(pod);
        if (headers.length && countReferences(sources, {usage: 'headers', headers}) > 0) {
            manifest[pod] = {usage: 'headers', headers};
            continue;
        }

        // Nothing in the sources reaches this pod. It is either dead or alive by a
        // route the sources do not show — a build phase, a linker flag, another pod
        // depending on it. Keep whatever reason was already recorded so a
        // regeneration does not wipe it.
        const existing = previous[pod];
        manifest[pod] = existing?.usage === 'exempt' ? existing : {usage: 'exempt', reason: '', reviewed: ''};
    }

    writeManifest(manifest);

    const blank = Object.entries(manifest).filter(([, entry]) => entry.usage === 'exempt' && !entry.reason);
    console.log(`Wrote ${Object.keys(manifest).length} pods to ${path.relative(process.cwd(), MANIFEST_PATH)}.`);
    if (blank.length) {
        console.log(`\n${blank.length} pod(s) need a reason before the check will pass:`);
        for (const [pod] of blank) {
            console.log(`  ${pod}`);
        }
    }
}

main();
