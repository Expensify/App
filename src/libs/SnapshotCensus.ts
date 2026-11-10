/**
 * Dev-only census of the Search snapshot redirect in `useOnyx` (callstack-internal#3063).
 *
 * With `USE_SNAPSHOT_CENSUS=true` in `.env`, every `useOnyx` read that the wrapper redirects to `snapshot_<hash>` is recorded
 * per call site, and the snapshot copy is compared with the live value read at the same moment. `window.snapshotCensus.dump()`
 * prints a tree of the redirected bindings and saves `snapshot-census.json` with the bindings and the snapshot sizes.
 * It only observes: it adds no subscription and never changes what `useOnyx` returns.
 */

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxKey, OnyxValue} from 'react-native-onyx';

import {deepEqual} from 'fast-equals';
import React from 'react';
// Default import like wdyr.ts: on web `react-native-config` resolves to `react-web-config`, which has no named `Config` export
// eslint-disable-next-line import/no-named-as-default
import Config from 'react-native-config';
import Onyx from 'react-native-onyx';

import {isRecord} from './ObjectUtils';
import saveTextFile from './saveTextFile';

type FieldDiffKind = 'snapshot-only' | 'live-only' | 'value';

type Verdict = 'snapshot-dependent' | 'snapshot-missing' | 'live-superset' | 'identical';

type Binding = {
    /** Caller frame location plus key pattern, unique per `useOnyx` call site */
    id: string;

    /** Function that called `useOnyx` (a hook or a component) */
    fn: string;

    /** Source file of the caller, e.g. `src/hooks/usePolicy.ts` */
    file: string;

    /** Read key with its ID stripped, e.g. `report_<id>` or `report_` */
    keyPattern: string;

    hasSelector: boolean;

    /**
     * Distinct places that rendered this binding. `hookChain` runs from the component down to the `useOnyx` caller,
     * e.g. `['MoneyRequestView', 'usePolicy']`, and is exact. `ownerPath` lists the owner components (root to leaf) and is
     * best effort: React stops recording owner stacks for elements created after the first 10,000 within a second, so heavy lists can drop names.
     */
    paths: Array<{hookChain: string[]; ownerPath: string}>;

    renders: number;

    /** Comparisons per outcome. One comparison can count as both `liveMissing` and `fieldDiff` for a collection. */
    counts: {identical: number; liveMissing: number; fieldDiff: number; snapshotMissing: number};

    /** Top-level fields that differed between the snapshot and live copies, values never recorded */
    fields: Record<string, FieldDiffKind>;
};

type SnapshotRowSize = {
    key: string;
    type?: unknown;
    state?: unknown;
    entries: number;
    entriesByPrefix: Record<string, number>;
    chars: number;
};

type SnapshotSizes = {
    count: number;
    totalChars: number;
    medianChars: number;
    maxChars: number;
    rows: SnapshotRowSize[];
};

type SnapshotCensusResult = {
    createdAt: string;
    notes: string[];
    bindings: Array<Binding & {verdict: Verdict}>;
    sizes: {
        inMemory: SnapshotSizes;
        persisted: SnapshotSizes;
        persistedStoreChars: number;
        persistedSnapshotShare: number;
    };
};

type Frame = {fn: string; location: string};

type Selector = (data: OnyxValue<OnyxKey> | undefined) => unknown;

type GetKeyData = (snapshot: SearchResults, key: OnyxKey) => unknown;

// `__DEV__` keeps this dead code in production bundles even if the env key is set
const IS_ENABLED = __DEV__ && Config?.USE_SNAPSHOT_CENSUS === 'true';

// Owner stacks are captured on every render until a binding has this many distinct paths
const MAX_PATHS = 10;
const MAX_HOOK_CHAIN = 8;
// V8 keeps 10 frames by default, which can cut a deep hook chain before it reaches the component
const STACK_TRACE_LIMIT = 50;

const bindings = new Map<string, Binding>();
const lastCompared = new Map<string, [unknown, unknown]>();

function isSnapshotCensusEnabled(): boolean {
    return IS_ENABLED;
}

// V8 frame format, as served by the web dev build: `at usePolicy (webpack-internal:///./src/hooks/usePolicy.ts:23:85)`
const FRAME_REGEX = /^\s*at (?:(.+?) \()?(.+?)\)?$/;

function parseFrames(stack: string | null | undefined): Frame[] {
    const frames: Frame[] = [];
    for (const line of (stack ?? '').split('\n')) {
        const match = FRAME_REGEX.exec(line);
        if (!match) {
            continue;
        }
        frames.push({fn: (match[1] ?? '').split('.').at(-1) ?? '', location: match[2]});
    }
    return frames;
}

function isComponentName(name: string): boolean {
    return /^[A-Z]/.test(name);
}

function getFile(location: string): string {
    return location.replace(/^.*?(src\/)/, '$1').replace(/:\d+:\d+$/, '');
}

function getKeyPattern(key: OnyxKey): string {
    const collectionPrefix = CONST.SEARCH.SNAPSHOT_ONYX_KEYS.find((prefix) => prefix.endsWith('_') && key.startsWith(prefix) && key !== prefix);
    return collectionPrefix ? `${collectionPrefix}<id>` : key;
}

// A read of a whole collection or of `personalDetailsList` (the keys listed as-is) gets only the snapshot's subset of members,
// so only those members are compared. A member key such as `report_1` is not in the list.
function isMemberMap(key: OnyxKey): boolean {
    return CONST.SEARCH.SNAPSHOT_ONYX_KEYS.includes(key);
}

function getOwnerPath(): string | undefined {
    const ownerStack = React.captureOwnerStack?.();
    const names = parseFrames(ownerStack)
        .map((frame) => frame.fn)
        .filter(isComponentName)
        .reverse();
    return names.length > 0 ? names.join(' › ') : undefined;
}

type Outcome = {
    isLiveMissing: boolean;
    hasFieldDiff: boolean;
    isSnapshotMissing: boolean;
    fields: Record<string, FieldDiffKind>;
};

function getFieldDiffs(snapshotValue: unknown, liveValue: unknown): Record<string, FieldDiffKind> {
    const fields: Record<string, FieldDiffKind> = {};
    if (!isRecord(snapshotValue) || !isRecord(liveValue)) {
        return fields;
    }
    for (const field of new Set([...Object.keys(snapshotValue), ...Object.keys(liveValue)])) {
        const isInSnapshot = snapshotValue[field] !== undefined;
        const isInLive = liveValue[field] !== undefined;
        if (isInSnapshot && !isInLive) {
            fields[field] = 'snapshot-only';
        } else if (!isInSnapshot && isInLive) {
            fields[field] = 'live-only';
        } else if (isInSnapshot && !deepEqual(snapshotValue[field], liveValue[field])) {
            fields[field] = 'value';
        }
    }
    return fields;
}

// A field ever seen as `snapshot-only` or `value` keeps that kind, since it is what makes a binding depend on the snapshot
function mergeFields(fields: Record<string, FieldDiffKind>, newFields: Record<string, FieldDiffKind>): Record<string, FieldDiffKind> {
    const merged = {...fields};
    for (const [field, kind] of Object.entries(newFields)) {
        if (merged[field] === undefined || merged[field] === 'live-only') {
            merged[field] = kind;
        }
    }
    return merged;
}

function compareMemberMap(snapshotSlice: unknown, liveValue: unknown): Outcome {
    const liveMembers = isRecord(liveValue) ? liveValue : {};
    const outcome: Outcome = {isLiveMissing: false, hasFieldDiff: false, isSnapshotMissing: false, fields: {}};
    for (const [memberKey, snapshotMember] of Object.entries(isRecord(snapshotSlice) ? snapshotSlice : {})) {
        if (snapshotMember === undefined || snapshotMember === null) {
            continue;
        }
        const liveMember = liveMembers[memberKey];
        if (liveMember === undefined || liveMember === null) {
            outcome.isLiveMissing = true;
            continue;
        }
        if (!deepEqual(snapshotMember, liveMember)) {
            outcome.hasFieldDiff = true;
            outcome.fields = mergeFields(outcome.fields, getFieldDiffs(snapshotMember, liveMember));
        }
    }
    return outcome;
}

function compareEntry(snapshotSlice: unknown, liveValue: unknown, selector: Selector | undefined): Outcome {
    const outcome: Outcome = {isLiveMissing: false, hasFieldDiff: false, isSnapshotMissing: false, fields: {}};
    const isSnapshotEmpty = snapshotSlice === undefined || snapshotSlice === null;
    const isLiveEmpty = liveValue === undefined || liveValue === null;
    if (isSnapshotEmpty || isLiveEmpty) {
        outcome.isSnapshotMissing = isSnapshotEmpty && !isLiveEmpty;
        outcome.isLiveMissing = !isSnapshotEmpty && isLiveEmpty;
        return outcome;
    }
    // The selector output is what the binding consumes, so a raw difference the selector drops does not count
    const isEqual = deepEqual(snapshotSlice, liveValue) || (!!selector && deepEqual(selector(snapshotSlice as OnyxValue<OnyxKey>), selector(liveValue as OnyxValue<OnyxKey>)));
    if (!isEqual) {
        outcome.hasFieldDiff = true;
        outcome.fields = getFieldDiffs(snapshotSlice, liveValue);
    }
    return outcome;
}

function compare(bindingID: string, key: OnyxKey, searchHash: number, selector: Selector | undefined, getKeyData: GetKeyData) {
    const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}` as const;
    // Reading both copies in one call gives values from the same store state, so no write can land between them
    // eslint-disable-next-line rulesdir/no-onyx-get-snapshot-key, rulesdir/no-unsafe-onyx-read -- dev-only census that compares the snapshot with live on purpose
    Onyx.multiGet([snapshotKey, key]).then(([snapshotRow, liveValue]) => {
        const binding = bindings.get(bindingID);
        const comparedKey = `${bindingID}|${key}`;
        const last = lastCompared.get(comparedKey);
        if (!binding || (last && last[0] === snapshotRow && last[1] === liveValue)) {
            return;
        }
        lastCompared.set(comparedKey, [snapshotRow, liveValue]);

        const snapshotSlice = snapshotRow ? getKeyData(snapshotRow, key) : undefined;
        const outcome = isMemberMap(key) ? compareMemberMap(snapshotSlice, liveValue) : compareEntry(snapshotSlice, liveValue, selector);
        if (outcome.isLiveMissing) {
            binding.counts.liveMissing++;
        }
        if (outcome.hasFieldDiff) {
            binding.counts.fieldDiff++;
        }
        if (outcome.isSnapshotMissing) {
            binding.counts.snapshotMissing++;
        }
        if (!outcome.isLiveMissing && !outcome.hasFieldDiff && !outcome.isSnapshotMissing) {
            binding.counts.identical++;
        }
        binding.fields = mergeFields(binding.fields, outcome.fields);
    });
}

/** Called by `useOnyx` during render for every read it redirects to a snapshot. Keeps render work to a stack capture. */
function getHookChain(frames: Frame[]): string[] {
    const hookChain: string[] = [];
    for (const frame of frames.slice(0, MAX_HOOK_CHAIN)) {
        // React calls components from `react_stack_bottom_frame`, so anything from there down is React itself
        if (frame.fn === 'react_stack_bottom_frame' || frame.location.includes('/node_modules/')) {
            break;
        }
        if (!frame.fn) {
            continue;
        }
        hookChain.unshift(frame.fn);
        if (isComponentName(frame.fn)) {
            break;
        }
    }
    return hookChain;
}

function recordSnapshotRead(key: OnyxKey, searchHash: number, selector: Selector | undefined, getKeyData: GetKeyData) {
    const {stackTraceLimit} = Error;
    Error.stackTraceLimit = STACK_TRACE_LIMIT;
    const stack = new Error().stack;
    Error.stackTraceLimit = stackTraceLimit;
    const frames = parseFrames(stack);
    const wrapperIndex = frames.findLastIndex((frame) => frame.location.includes('/hooks/useOnyx.'));
    const caller = frames.at(wrapperIndex + 1);
    if (wrapperIndex === -1 || !caller) {
        return;
    }

    const keyPattern = getKeyPattern(key);
    const id = `${caller.location}|${keyPattern}`;
    let binding = bindings.get(id);
    if (!binding) {
        binding = {
            id,
            fn: caller.fn,
            file: getFile(caller.location),
            keyPattern,
            hasSelector: !!selector,
            paths: [],
            renders: 0,
            counts: {identical: 0, liveMissing: 0, fieldDiff: 0, snapshotMissing: 0},
            fields: {},
        };
        bindings.set(id, binding);
    }
    binding.renders++;

    // A shared hook is reached from several components and parents, so every render can add a new path
    if (binding.paths.length < MAX_PATHS) {
        const hookChain = getHookChain(frames.slice(wrapperIndex + 1));
        const ownerPath = getOwnerPath() ?? '';
        const chain = hookChain.join(' › ');
        if (!binding.paths.some((path) => path.ownerPath === ownerPath && path.hookChain.join(' › ') === chain)) {
            binding.paths.push({hookChain, ownerPath});
        }
    }

    compare(id, key, searchHash, selector, getKeyData);
}

function getVerdict(binding: Binding): Verdict {
    const fieldKinds = Object.values(binding.fields);
    if (binding.counts.liveMissing > 0 || fieldKinds.some((kind) => kind !== 'live-only')) {
        return 'snapshot-dependent';
    }
    // The redirect hid a value that live has
    if (binding.counts.snapshotMissing > 0) {
        return 'snapshot-missing';
    }
    return fieldKinds.length > 0 ? 'live-superset' : 'identical';
}

function measureSnapshots(rows: Array<[string, unknown]>): SnapshotSizes {
    const sizes = rows.map(([key, value]): SnapshotRowSize => {
        const data = isRecord(value) && isRecord(value.data) ? value.data : {};
        const search = isRecord(value) && isRecord(value.search) ? value.search : {};
        const entriesByPrefix: Record<string, number> = {};
        for (const dataKey of Object.keys(data)) {
            const prefix = dataKey.includes('_') ? dataKey.slice(0, dataKey.indexOf('_') + 1) : dataKey;
            entriesByPrefix[prefix] = (entriesByPrefix[prefix] ?? 0) + 1;
        }
        return {key, type: search.type, state: search.state, entries: Object.keys(data).length, entriesByPrefix, chars: JSON.stringify(value ?? null).length};
    });
    const chars = sizes.map((row) => row.chars).sort((a, b) => a - b);
    return {
        count: sizes.length,
        totalChars: chars.reduce((sum, value) => sum + value, 0),
        medianChars: chars.at(Math.floor(chars.length / 2)) ?? 0,
        maxChars: chars.at(-1) ?? 0,
        rows: sizes.sort((a, b) => b.chars - a.chars),
    };
}

type TreeNode = {children: Map<string, TreeNode>; leaves: string[]};

function printTree(node: TreeNode, indent: string, lines: string[]) {
    for (const leaf of node.leaves) {
        lines.push(`${indent}${leaf}`);
    }
    for (const [name, child] of node.children) {
        // Collapse single-child chains, so the shared root of every owner path prints as one line
        const labels = [name];
        let current = child;
        while (current.leaves.length === 0 && current.children.size === 1) {
            const [nextName, nextChild] = [...current.children][0];
            labels.push(nextName);
            current = nextChild;
        }
        lines.push(`${indent}${labels.join(' › ')}`);
        printTree(current, `${indent}  `, lines);
    }
}

function buildTree(results: SnapshotCensusResult['bindings']): string {
    const root: TreeNode = {children: new Map(), leaves: []};
    for (const binding of results) {
        const fieldNames = Object.entries(binding.fields).map(([field, kind]) => `${field} (${kind})`);
        const leaf = `useOnyx(${binding.keyPattern}) [${binding.verdict}]${binding.verdict !== 'snapshot-missing' && binding.counts.snapshotMissing > 0 ? ' [snapshot-missing]' : ''} ${binding.file}${fieldNames.length > 0 ? ` · ${fieldNames.join(', ')}` : ''}`;
        for (const {hookChain, ownerPath} of binding.paths) {
            const owners = ownerPath ? ownerPath.split(' › ') : [];
            // The owner stack can already end with the component that holds the hook chain
            const path = owners.at(-1) === hookChain.at(0) ? [...owners, ...hookChain.slice(1)] : [...owners, ...hookChain];
            let node = root;
            for (const name of path) {
                let child = node.children.get(name);
                if (!child) {
                    child = {children: new Map(), leaves: []};
                    node.children.set(name, child);
                }
                node = child;
            }
            node.leaves.push(leaf);
        }
    }
    const lines: string[] = [];
    printTree(root, '', lines);
    return lines.join('\n');
}

/** Prints the binding tree, saves `snapshot-census.json` and returns the same object. */
async function dumpSnapshotCensus(): Promise<SnapshotCensusResult> {
    // eslint-disable-next-line rulesdir/no-onyx-get-snapshot-key, rulesdir/no-unsafe-onyx-read -- dev-only census that measures every cached snapshot row
    const cachedSnapshots = await Onyx.get(ONYXKEYS.COLLECTION.SNAPSHOT);
    const persistedState = await Onyx.exportState();
    const persistedEntries = Object.entries(persistedState);
    const persistedStoreChars = persistedEntries.reduce((sum, [, value]) => sum + JSON.stringify(value ?? null).length, 0);
    const persisted = measureSnapshots(persistedEntries.filter(([key]) => key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT)));

    const result: SnapshotCensusResult = {
        createdAt: new Date().toISOString(),
        notes: [
            'Owner paths are best effort: React stops recording owner stacks for elements created after the first 10,000 within a second. Hook chains and files are exact.',
            'Collection reads compare only the members in the snapshot, on raw values. Review the ones with hasSelector by hand.',
        ],
        bindings: [...bindings.values()].map((binding) => ({...binding, verdict: getVerdict(binding)})),
        sizes: {
            inMemory: measureSnapshots(Object.entries(cachedSnapshots ?? {})),
            persisted,
            persistedStoreChars,
            persistedSnapshotShare: persistedStoreChars > 0 ? persisted.totalChars / persistedStoreChars : 0,
        },
    };

    // eslint-disable-next-line no-console
    console.log(buildTree(result.bindings));
    await saveTextFile({fileName: 'snapshot-census.json', content: JSON.stringify(result, null, 2)});
    return result;
}

export {isSnapshotCensusEnabled, recordSnapshotRead, dumpSnapshotCensus};
export type {SnapshotCensusResult};
