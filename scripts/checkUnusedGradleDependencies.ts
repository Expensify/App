#!/usr/bin/env bun
/**
 * Fails when a dependency declared in android/app/build.gradle is no longer
 * reached from the project.
 *
 * Android has no committed lockfile and no build failure to warn us: a Gradle
 * declaration whose last consumer was deleted keeps being resolved, compiled and
 * packaged. Knip cannot help either — it reads JavaScript and TypeScript. This
 * check is what notices.
 *
 * Every declared coordinate needs an entry in android/app/dependency-usage.json.
 * `packages` entries are verified against Java and Kotlin imports, `resources`
 * entries against the XML — a view class in a layout, a style parent, an attr.
 * `exempt` is for the artifacts that are genuinely needed with nothing in the
 * project to prove it — a version pin, a BOM, a library React Native reaches
 * rather than our own code — and each one carries a reason and the date it was
 * last checked.
 *
 * Usage: npx bun scripts/checkUnusedGradleDependencies.ts
 */

import path from 'path';

import type {GradleUsageEntry} from './gradleUsageShared';

import {MANIFEST_PATH, countReferences, readDeclaredDependencies, readManifest, readResources, readSources} from './gradleUsageShared';

const RELATIVE_MANIFEST = path.relative(path.resolve(__dirname, '..'), MANIFEST_PATH);
const USAGES = new Set(['packages', 'resources', 'exempt']);

function validateEntry(coordinate: string, entry: GradleUsageEntry): string | undefined {
    if (!entry || !USAGES.has(entry.usage)) {
        return `${coordinate}: "usage" must be one of ${[...USAGES].join(', ')}.`;
    }
    if (entry.usage === 'packages' && !entry.packages?.length) {
        return `${coordinate}: a "packages" entry needs at least one Java package prefix.`;
    }
    if (entry.usage === 'resources' && !entry.resources?.length) {
        return `${coordinate}: a "resources" entry needs at least one name to look for in the XML.`;
    }
    if (entry.usage === 'exempt') {
        if (!entry.reason) {
            return `${coordinate}: an "exempt" entry needs a "reason" saying what keeps the dependency alive.`;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.reviewed ?? '')) {
            return `${coordinate}: an "exempt" entry needs "reviewed" as YYYY-MM-DD.`;
        }
    }
    return undefined;
}

function main() {
    const manifest = readManifest();
    const declared = readDeclaredDependencies();
    const problems: string[] = [];

    for (const coordinate of declared) {
        if (!(coordinate in manifest)) {
            problems.push(`${coordinate} is declared in android/app/build.gradle but missing from ${RELATIVE_MANIFEST}. Run \`npx bun scripts/generateGradleDependencyUsage.ts\`.`);
        }
    }

    for (const coordinate of Object.keys(manifest)) {
        if (!declared.includes(coordinate)) {
            problems.push(`${coordinate} is in ${RELATIVE_MANIFEST} but no longer declared in android/app/build.gradle. Delete the entry.`);
        }
    }

    const context = {sources: readSources(), resources: readResources()};
    for (const coordinate of declared) {
        const entry = manifest[coordinate];
        if (!entry) {
            continue;
        }
        const invalid = validateEntry(coordinate, entry);
        if (invalid) {
            problems.push(invalid);
            continue;
        }
        if (entry.usage === 'exempt') {
            continue;
        }
        if (countReferences(context, entry) === 0) {
            const route = entry.usage === 'packages' ? `imports of ${entry.packages.join(', ')}` : `${entry.resources.join(', ')} in the XML`;
            problems.push(`${coordinate} is declared in android/app/build.gradle but nothing reaches it (looked for ${route}). Delete the dependency, or mark it "exempt" with a reason.`);
        }
    }

    if (problems.length) {
        console.error('Unused Gradle dependency check failed:\n');
        for (const problem of problems) {
            console.error(`  - ${problem}`);
        }
        process.exit(1);
    }

    console.log(`Unused Gradle dependency check passed: ${declared.length} dependencies declared, all reached or exempt with a reason.`);
}

main();
