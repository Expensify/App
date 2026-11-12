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
 * last checked. That date is validated as a real, non-future date and reported
 * as a warning once it is over a year old; it is not a failure, so an exemption
 * never breaks the build on a date nobody chose.
 *
 * Usage: npx bun scripts/checkUnusedGradleDependencies.ts
 */

import path from 'path';

import type {GradleUsageEntry} from './gradleUsageShared';

import {MANIFEST_PATH, RELATIVE_BUILD_GRADLE, countReferences, findUnparsedDeclarations, readDeclaredDependencies, readManifest, readResources, readSources} from './gradleUsageShared';
import {findBlankEntry, validateReviewedDate} from './nativeUsageManifest';

const RELATIVE_MANIFEST = path.relative(path.resolve(__dirname, '..'), MANIFEST_PATH);
const USAGES = new Set(['packages', 'resources', 'exempt']);
const MINIMUM_RESOURCE_NAME_LENGTH = 8;

function validateEntry(coordinate: string, entry: GradleUsageEntry): {error?: string; warning?: string} {
    if (!USAGES.has(entry.usage)) {
        return {error: `${coordinate}: "usage" must be one of ${[...USAGES].join(', ')}.`};
    }
    if (entry.usage === 'packages') {
        if (!entry.packages.length) {
            return {error: `${coordinate}: a "packages" entry needs at least one Java package prefix.`};
        }
        const blank = findBlankEntry(entry.packages, coordinate, 'packages');
        if (blank) {
            return {error: blank};
        }
    }
    if (entry.usage === 'resources') {
        if (!entry.resources.length) {
            return {error: `${coordinate}: a "resources" entry needs at least one name to look for in the XML.`};
        }
        const blank = findBlankEntry(entry.resources, coordinate, 'resources');
        if (blank) {
            return {error: blank};
        }
        // An unqualified or short name matches too much of the XML to prove
        // anything: `name` alone occurs in hundreds of places, so a dead
        // coordinate could be made permanently green with it.
        const vague = entry.resources.find((name) => name.trim().length < MINIMUM_RESOURCE_NAME_LENGTH || !name.includes('.'));
        if (vague) {
            return {
                error: `${coordinate}: the "resources" name ${vague} is not specific enough to identify the dependency. Use the fully qualified class or attr name, at least ${MINIMUM_RESOURCE_NAME_LENGTH} characters and containing a dot.`,
            };
        }
    }
    if (entry.usage === 'exempt') {
        if (!entry.reason.trim()) {
            return {error: `${coordinate}: an "exempt" entry needs a "reason" saying what keeps the dependency alive.`};
        }
        return validateReviewedDate(entry.reviewed, coordinate);
    }
    return {};
}

/**
 * Two coordinates whose package prefixes overlap cannot be told apart: whichever
 * one still has a consumer keeps the other green. That is how a group-wide prefix
 * such as `com.facebook.react` would "verify" `hermes-android` off imports that
 * belong to `react-android`. A hand-written prefix this wide is legitimate only
 * while it is the sole claim on that namespace.
 */
function findOverlappingPackages(manifest: Record<string, GradleUsageEntry>): string[] {
    const claims = Object.entries(manifest).flatMap(([coordinate, entry]) => (entry.usage === 'packages' ? entry.packages.map((prefix) => ({coordinate, prefix})) : []));
    const problems: string[] = [];
    for (const [index, claim] of claims.entries()) {
        for (const other of claims.slice(index + 1)) {
            if (other.coordinate === claim.coordinate) {
                continue;
            }
            const overlaps = claim.prefix === other.prefix || claim.prefix.startsWith(`${other.prefix}.`) || other.prefix.startsWith(`${claim.prefix}.`);
            if (overlaps) {
                problems.push(
                    `${claim.coordinate} and ${other.coordinate} both claim overlapping packages (${claim.prefix} and ${other.prefix}), so an import cannot tell them apart. Narrow one of them, or mark the artifact that does not own the package "exempt" with a reason.`,
                );
            }
        }
    }
    return problems;
}

function main() {
    let manifest;
    try {
        manifest = readManifest();
    } catch (error) {
        console.error(`Unused Gradle dependency check failed:\n\n  - ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
    const declared = readDeclaredDependencies();
    const problems: string[] = [];
    const warnings: string[] = [];

    problems.push(...findOverlappingPackages(manifest));

    for (const unparsed of findUnparsedDeclarations()) {
        problems.push(`${unparsed}\n    This declaration is in a form the check cannot read, so it would be verified by nothing. Teach scripts/gradleUsageShared.ts to read it.`);
    }

    // A parser that matches nothing would otherwise report success over an empty
    // set, which is the one failure mode this check cannot afford.
    if (!declared.length) {
        problems.push(`No dependencies were parsed out of ${RELATIVE_BUILD_GRADLE}. Either it declares none, or the parser in scripts/gradleUsageShared.ts no longer understands it.`);
    }

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
        const {error, warning} = validateEntry(coordinate, entry);
        if (warning) {
            warnings.push(warning);
        }
        if (error) {
            problems.push(error);
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

    if (warnings.length) {
        console.warn('Unused Gradle dependency check warnings:\n');
        for (const warning of warnings) {
            console.warn(`  - ${warning}`);
        }
        console.warn('');
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
