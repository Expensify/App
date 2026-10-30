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
 * A group-wide prefix is only ever proposed when no other declared coordinate
 * shares that group. Several artifacts usually do share one, and then the prefix
 * is satisfied by any sibling's imports: `com.facebook.react:hermes-android`
 * would be "verified" by `import com.facebook.react.*`, which belongs to
 * `react-android`, and a BOM would be verified by the artifacts it only aligns
 * versions for. An entry like that can never fail, so writing one is worse than
 * writing none.
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
 * Package prefixes worth trying for a coordinate, most specific first. A
 * group-wide prefix is last because it is the weakest: it is right for a group
 * with one artifact in it, and a free ride for a group with several, which is
 * what `findAmbiguousPrefixes` then strips out.
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
    // JitPack rewrites the group as com.github.<user>, while the classes keep
    // their original package.
    if (group.startsWith('com.github.')) {
        const tail = group.slice('com.github.'.length);
        add(`com.${tail}.${artifact.replaceAll('-', '.')}`);
        add(`com.${tail}`);
        add(tail);
    }
    add(group);
    return [...candidates];
}

/**
 * Prefixes that more than one declared coordinate would claim. Such a prefix
 * cannot tell the two apart, so it proves nothing about either.
 */
function findAmbiguousPrefixes(coordinates: string[]): Set<string> {
    const owners = new Map<string, number>();
    for (const coordinate of coordinates) {
        for (const prefix of candidatePackages(coordinate)) {
            owners.set(prefix, (owners.get(prefix) ?? 0) + 1);
        }
    }
    return new Set([...owners.entries()].filter(([, count]) => count > 1).map(([prefix]) => prefix));
}

function main() {
    const context = {sources: readSources(), resources: readResources()};
    const previous: GradleUsageManifest = fs.existsSync(MANIFEST_PATH) ? readManifest() : {};
    const manifest: GradleUsageManifest = {};
    const declared = readDeclaredDependencies();
    const ambiguous = findAmbiguousPrefixes(declared);

    for (const coordinate of declared) {
        const existing = previous[coordinate];
        if (existing && (existing.usage !== 'exempt' || existing.reason)) {
            manifest[coordinate] = existing;
            continue;
        }

        const packages = candidatePackages(coordinate)
            .filter((prefix) => !ambiguous.has(prefix))
            .filter((prefix) => countReferences(context, {usage: 'packages', packages: [prefix]}) > 0);
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
