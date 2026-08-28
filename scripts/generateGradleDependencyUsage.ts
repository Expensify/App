#!/usr/bin/env bun
/**
 * Proposes android/app/dependency-usage.json entries for the dependencies
 * declared in android/app/build.gradle.
 *
 * A Maven coordinate does not tell you the Java package its classes live in —
 * `com.github.bumptech.glide:glide` ships `com.bumptech.glide` — so this script
 * guesses candidate prefixes from the coordinate and keeps the ones the sources
 * actually import. Anything it cannot resolve is written out as `exempt` with an
 * empty reason, and the check rejects that until a human either fills in the
 * reason or replaces the entry with the right package.
 *
 * Existing entries are preserved: run it after adding a dependency, then review.
 *
 * Usage: npx bun scripts/generateGradleDependencyUsage.ts
 */

import fs from 'fs';
import path from 'path';

import type {GradleUsageManifest} from './gradleUsageShared';

import {MANIFEST_PATH, countReferences, readDeclaredDependencies, readManifest, readResources, readSources, writeManifest} from './gradleUsageShared';

/**
 * Package prefixes worth trying for a coordinate, most specific first.
 */
function candidatePackages(coordinate: string): string[] {
    const [group, artifact] = coordinate.split(':');
    const candidates = new Set<string>();
    const add = (value: string) => {
        if (!value) {
            return;
        }
        candidates.add(value);
    };

    add(`${group}.${artifact.replaceAll('-', '.')}`);
    add(group);
    // JitPack rewrites the group as com.github.<user>, while the classes keep
    // their original package.
    if (group.startsWith('com.github.')) {
        const tail = group.slice('com.github.'.length);
        add(`com.${tail}`);
        add(tail);
    }
    return [...candidates];
}

function main() {
    const context = {sources: readSources(), resources: readResources()};
    const previous: GradleUsageManifest = fs.existsSync(MANIFEST_PATH) ? readManifest() : {};
    const manifest: GradleUsageManifest = {};

    for (const coordinate of readDeclaredDependencies()) {
        const existing = previous[coordinate];
        if (existing && (existing.usage !== 'exempt' || existing.reason)) {
            manifest[coordinate] = existing;
            continue;
        }

        const packages = candidatePackages(coordinate).filter((prefix) => countReferences(context, {usage: 'packages', packages: [prefix]}) > 0);
        manifest[coordinate] = packages.length ? {usage: 'packages', packages} : {usage: 'exempt', reason: '', reviewed: ''};
    }

    writeManifest(manifest);

    const blank = Object.entries(manifest).filter(([, entry]) => entry.usage === 'exempt' && !entry.reason);
    console.log(`Wrote ${Object.keys(manifest).length} dependencies to ${path.relative(process.cwd(), MANIFEST_PATH)}.`);
    if (blank.length) {
        console.log(`\n${blank.length} dependency/dependencies need a package prefix or a reason:`);
        for (const [coordinate] of blank) {
            console.log(`  ${coordinate}`);
        }
    }
}

main();
