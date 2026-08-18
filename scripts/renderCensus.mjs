#!/usr/bin/env node

/**
 * Counts how many renders in a recorded session are components re-rendering for Onyx data they
 * never display.
 *
 * The static classifier says how many bridge subscriptions exist; it cannot say how often they
 * actually fire. This closes that gap by intersecting two sources:
 *
 *   1. `analyzeOnyxSubscriptions.ts --json` — which files have *only* non-render `useOnyx` bindings
 *      (Tier A). Nothing those components render depends on Onyx.
 *   2. A React DevTools profile export — which renders were caused by a hook change alone, with no
 *      props, state or context change.
 *
 * A hooks-only render of a Tier A component is provably wasted: the only thing that could have
 * changed is a subscription whose value never reaches the output. That is the number the problem
 * statement needs, and it is measured on ordinary `main` — the fix is not required to quantify the
 * problem.
 *
 * Deliberately a lower bound. Mixed files (a component with both render and non-render bindings)
 * are counted as unattributable rather than guessed at: `changeDescriptions` reports hook indices
 * across all hooks, not just `useOnyx`, and custom-hook flattening makes index→binding mapping
 * unreliable. Hooks files are likewise unattributable, because a hook's subscriptions surface under
 * whichever component called it.
 *
 * Usage:
 *   node renderCensus.mjs --classifier <analysis.json> <profile.json> [<profile.json> ...]
 *   node renderCensus.mjs --classifier <analysis.json> --json <profile.json>
 *
 * Produce the classifier input with:
 *   bun analyzeOnyxSubscriptions.ts --json > analysis.json
 */

import fs from 'node:fs';
import path from 'node:path';

/** E/App names files after what they export, so the basename is the component name. */
function componentNameFor(file) {
    const base = path.basename(file).replace(/\.(tsx|ts)$/, '');
    if (base === 'index' || /^index\.(native|ios|android|web|desktop)$/.test(base)) {
        return path.basename(path.dirname(file));
    }
    return base.replace(/\.(native|ios|android|web|desktop)$/, '');
}

const UNRESOLVED = '<unresolved>';

const isHookFile = (file) => /^use[A-Z]/.test(path.basename(file));

function loadClassifier(jsonPath) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const tierAComponents = new Map(); // component name -> file
    const tierAHooks = [];
    let mixed = 0;

    for (const summary of data.files) {
        const nonRender = (summary.bridge ?? 0) + (summary.deps ?? 0);
        if (nonRender === 0) {
            continue;
        }
        if ((summary.render ?? 0) > 0) {
            mixed += 1;
            continue;
        }
        if (isHookFile(summary.file)) {
            tierAHooks.push(summary.file);
            continue;
        }
        tierAComponents.set(componentNameFor(summary.file), summary.file);
    }

    return {tierAComponents, tierAHooks, mixed};
}

/** Classify one render by what actually changed. */
function causeOf(change) {
    if (!change) {
        return 'unrecorded';
    }
    if (change.isFirstMount) {
        return 'mount';
    }
    const hooks = !!(change.hooks && change.hooks.length);
    const props = !!(change.props && change.props.length);
    const state = !!(change.state && change.state.length);
    const context = !!change.context;

    if (hooks && !props && !state && !context) {
        return 'hooks-only';
    }
    if (!hooks && !props && !state && !context) {
        return 'no-change';
    }
    return 'other';
}

/**
 * React Compiler and React wrap display names — `Forget(Row)`, `Memo(ForwardRef(Row))`. The
 * classifier only knows the authored name, so unwrap before matching or almost everything misses.
 */
function unwrapName(name) {
    let out = name;
    let previous;
    do {
        previous = out;
        out = out.replace(/^(?:Forget|Memo|ForwardRef|Profiler|Lazy)\((.*)\)$/, '$1');
    } while (out !== previous);
    return out;
}

/**
 * `snapshots` is only the tree as it stood when recording began. Anything mounted later appears
 * solely in `operations`, which for a real session is the large majority of the components that
 * render. Walking the operation log is therefore mandatory, not an optimisation.
 *
 * Encoding: [rendererID, rootID, stringTableLength, ...stringTable, ...operations].
 */
function buildNameMap(root) {
    const names = new Map();
    for (const [id, node] of root.snapshots ?? []) {
        if (node && node.displayName) {
            names.set(id, unwrapName(node.displayName));
        }
    }

    for (const ops of root.operations ?? []) {
        const stringTableLength = ops[2];
        let i = 3;
        const stringTableEnd = 3 + stringTableLength;
        const table = [null];
        while (i < stringTableEnd) {
            const length = ops[i++];
            table.push(String.fromCodePoint(...ops.slice(i, i + length)));
            i += length;
        }

        while (i < ops.length) {
            const operation = ops[i];
            if (operation === 1) {
                // TREE_OPERATION_ADD
                const id = ops[i + 1];
                const type = ops[i + 2];
                i += 3;
                if (type === 11) {
                    i += 4; // root: isStrictModeCompliant, supportsProfiling, supportsStrictMode, hasOwnerMetadata
                } else {
                    i += 2; // parentID, ownerID
                    const displayName = table[ops[i]];
                    i += 1;
                    i += 1; // keyStringID
                    i += 1; // compiledWithForget — present in this DevTools version's encoding
                    if (displayName) {
                        names.set(id, unwrapName(displayName));
                    }
                }
            } else if (operation === 2) {
                i += 2 + ops[i + 1]; // REMOVE
            } else if (operation === 3) {
                i += 3 + ops[i + 2]; // REORDER_CHILDREN
            } else if (operation === 4) {
                i += 3; // UPDATE_TREE_BASE_DURATION
            } else if (operation === 5) {
                i += 4; // UPDATE_ERRORS_OR_WARNINGS
            } else if (operation === 6) {
                i += 1; // REMOVE_ROOT
            } else if (operation === 7) {
                i += 3; // SET_SUBTREE_MODE
            } else {
                break; // unrecognised opcode — stop rather than misparse the rest
            }
        }
    }

    return names;
}

function censusOf(profilePath, classifier) {
    const root = JSON.parse(fs.readFileSync(profilePath, 'utf8')).dataForRoots[0];
    const names = buildNameMap(root);

    const totals = {renders: 0, mount: 0, 'hooks-only': 0, other: 0, 'no-change': 0, unrecorded: 0};
    let resolved = 0;
    let unresolved = 0;
    let wasted = 0;
    let hooksOnlyUnattributable = 0;
    const wastedBy = new Map();
    const hooksOnlyBy = new Map();
    let anyChangeDescriptions = false;

    for (const commit of root.commitData) {
        totals.renders += (commit.fiberActualDurations ?? []).length;
        const changes = commit.changeDescriptions ?? [];
        if (changes.length) {
            anyChangeDescriptions = true;
        }
        for (const [id, change] of changes) {
            const name = names.get(id) || UNRESOLVED;
            if (name === UNRESOLVED) {
                unresolved += 1;
            } else {
                resolved += 1;
            }
            const cause = causeOf(change);
            totals[cause] += 1;
            if (cause !== 'hooks-only') {
                continue;
            }
            hooksOnlyBy.set(name, (hooksOnlyBy.get(name) ?? 0) + 1);
            if (classifier.tierAComponents.has(name)) {
                wasted += 1;
                wastedBy.set(name, (wastedBy.get(name) ?? 0) + 1);
            } else {
                hooksOnlyUnattributable += 1;
            }
        }
    }

    return {profile: path.basename(profilePath), totals, wasted, hooksOnlyUnattributable, wastedBy, hooksOnlyBy, anyChangeDescriptions, resolved, unresolved};
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const classifierPath = args.at(args.indexOf('--classifier') + 1);
const profiles = args.filter((a) => !a.startsWith('--') && a !== classifierPath);

if (!args.includes('--classifier') || !classifierPath || profiles.length === 0) {
    console.error('usage: node renderCensus.mjs --classifier <analysis.json> <profile.json> [...]');
    process.exit(1);
}

const classifier = loadClassifier(classifierPath);
const results = profiles.map((p) => censusOf(p, classifier));

if (asJson) {
    console.log(
        JSON.stringify(
            results.map((r) => ({...r, wastedBy: Object.fromEntries(r.wastedBy), hooksOnlyBy: Object.fromEntries(r.hooksOnlyBy)})),
            null,
            2,
        ),
    );
} else {
    console.log(`Tier A components (all useOnyx non-render) : ${classifier.tierAComponents.size}`);
    console.log(`Tier A hooks (unattributable by name)      : ${classifier.tierAHooks.length}`);
    console.log(`Mixed files (excluded, ambiguous)          : ${classifier.mixed}`);

    for (const r of results) {
        const pct = (n) => (r.totals.renders ? `${((100 * n) / r.totals.renders).toFixed(1)}%` : '—');
        console.log(`\n=== ${r.profile}`);
        if (!r.anyChangeDescriptions) {
            console.log('  no changeDescriptions recorded — enable "Record why each component rendered" and re-capture');
            continue;
        }
        const attributed = r.resolved + r.unresolved;
        const coverage = attributed === 0 ? 0 : (100 * r.resolved) / attributed;
        console.log(`  name resolution      : ${coverage.toFixed(1)}% (${r.unresolved} unresolved)`);
        console.log(`  total renders        : ${r.totals.renders}`);
        console.log(`  first mount          : ${r.totals.mount}`);
        console.log(`  props/state/context  : ${r.totals.other}`);
        console.log(`  hooks-only           : ${r.totals['hooks-only']} (${pct(r.totals['hooks-only'])})`);
        console.log(`  no detected change   : ${r.totals['no-change']}`);
        console.log(`  WASTED (Tier A, hooks-only) : ${r.wasted} (${pct(r.wasted)} of all renders)`);
        console.log(`  hooks-only, unattributable  : ${r.hooksOnlyUnattributable}`);
        if (r.wastedBy.size) {
            console.log('  -- wasted renders by component --');
            const topWasted = [...r.wastedBy.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
            for (const [name, count] of topWasted) {
                console.log(`     ${String(count).padStart(5)}  ${name}`);
            }
        }
        console.log('  -- top hooks-only renders overall (attributable or not) --');
        const topHooksOnly = [...r.hooksOnlyBy.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
        for (const [name, count] of topHooksOnly) {
            console.log(`     ${String(count).padStart(5)}  ${name}${classifier.tierAComponents.has(name) ? '   [Tier A]' : ''}`);
        }
    }
}
