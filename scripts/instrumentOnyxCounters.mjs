#!/usr/bin/env node

/**
 * Installs notification counters and a timeline into an installed copy of react-native-onyx, so a
 * profiling run can be compared against another checkout by what Onyx actually did and when.
 *
 * This exists to settle questions React DevTools cannot answer. A profile shows that a component
 * re-rendered and that a prop changed; it does not show how many times Onyx wrote the key behind
 * that prop, nor when. Counts distinguish "the same write rendered twice" from "the key was written
 * twice". Timestamps distinguish "landed in the same React commit" from "landed in a later one" —
 * which is the difference between a batching win and a work-avoidance win, and counts alone cannot
 * tell them apart.
 *
 * Hooks attach at the top of `keyChanged` and `keysChanged` only. Those two signatures are identical
 * in the patched and unpatched builds, so the same instrumentation applies to both sides of an A/B
 * and cannot itself introduce a difference.
 *
 * Edits `node_modules` in place. Idempotent, and `--uninstall` restores the file byte-for-byte.
 *
 * Usage:
 *   node instrumentOnyxCounters.mjs <checkout> [<checkout> ...]
 *   node instrumentOnyxCounters.mjs --uninstall <checkout> [...]
 *   node instrumentOnyxCounters.mjs --status <checkout> [...]
 *
 * Then, in the app console:
 *   __onyxStats.reset()      // immediately before the interaction
 *   __onyxStats.timeline()   // what fired, in order, with ms offsets
 *   __onyxStats.gaps()       // pauses >100ms — where a separate React commit becomes likely
 *   __onyxStats.dump()       // counts per key
 *   __onyxStats.json()       // blob for offline comparison
 */

import fs from 'node:fs';
import path from 'node:path';

const BEGIN = '/* __ONYX_STATS_BEGIN__ */';
const END = '/* __ONYX_STATS_END__ */';
const HIT = '/* __ONYX_STATS_HIT__ */';

const PRELUDE = `${BEGIN}
(function () {
    const g = typeof globalThis !== 'undefined' ? globalThis : this;
    if (g.__onyxStats) {
        return;
    }
    const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
    const MAX_EVENTS = 20000;
    const s = {
        keyChanged: new Map(),
        keysChanged: new Map(),
        memberKeys: new Map(),
        totalKeyChanged: 0,
        totalKeysChanged: 0,
        totalMembers: 0,
        events: [],
        t0: now(),
        dropped: 0,
    };
    s.push = (kind, key, extra) => {
        if (s.events.length >= MAX_EVENTS) {
            s.dropped++;
            return;
        }
        s.events.push({t: now() - s.t0, kind, key, extra});
    };
    const top = (map, n) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
    g.__onyxStats = {
        _s: s,
        reset() {
            s.keyChanged.clear();
            s.keysChanged.clear();
            s.memberKeys.clear();
            s.totalKeyChanged = 0;
            s.totalKeysChanged = 0;
            s.totalMembers = 0;
            s.events.length = 0;
            s.dropped = 0;
            s.t0 = now();
            console.log('[onyxStats] reset');
        },
        /** Every notification in fire order, with ms since reset. This is the one that matters. */
        timeline(filterSubstring) {
            const rows = s.events
                .filter((e) => !filterSubstring || e.key.includes(filterSubstring))
                .map((e, i) => ({'#': i, 'ms': +e.t.toFixed(1), kind: e.kind, key: e.key, extra: e.extra ?? ''}));
            console.log('%c[onyxStats] timeline — ' + rows.length + ' notifications' + (s.dropped ? ' (' + s.dropped + ' dropped)' : ''), 'font-weight:bold');
            console.table(rows);
            return rows;
        },
        /** Pauses larger than thresholdMs. A gap here usually means a separate React commit. */
        gaps(thresholdMs) {
            const limit = thresholdMs || 100;
            const out = [];
            for (let i = 1; i < s.events.length; i++) {
                const delta = s.events[i].t - s.events[i - 1].t;
                if (delta >= limit) {
                    out.push({gapMs: +delta.toFixed(1), afterMs: +s.events[i - 1].t.toFixed(1), before: s.events[i - 1].key, after: s.events[i].key});
                }
            }
            console.log('%c[onyxStats] gaps >= ' + limit + 'ms — ' + out.length, 'font-weight:bold');
            console.table(out);
            return out;
        },
        dump(n) {
            const limit = n || 25;
            const span = s.events.length ? s.events[s.events.length - 1].t : 0;
            console.log('%c[onyxStats]', 'font-weight:bold');
            console.log('  keyChanged() calls   :', s.totalKeyChanged);
            console.log('  keysChanged() calls  :', s.totalKeysChanged);
            console.log('  collection members   :', s.totalMembers);
            console.log('  notification span    :', span.toFixed(1) + 'ms');
            const single = top(s.keyChanged, limit);
            if (single.length) {
                console.log('%c  -- keyChanged by key --', 'font-weight:bold');
                console.table(single.map(([key, count]) => ({key, count})));
            }
            const member = top(s.memberKeys, limit);
            if (member.length) {
                console.log('%c  -- collection members by key --', 'font-weight:bold');
                console.table(member.map(([key, count]) => ({key, count})));
            }
            const coll = top(s.keysChanged, limit);
            if (coll.length) {
                console.log('%c  -- keysChanged by collection --', 'font-weight:bold');
                console.table(coll.map(([key, count]) => ({key, count})));
            }
            return {totalKeyChanged: s.totalKeyChanged, totalKeysChanged: s.totalKeysChanged, totalMembers: s.totalMembers, spanMs: +span.toFixed(1)};
        },
        /** Every time one key fired, with offsets. */
        key(name) {
            const hits = s.events.filter((e) => e.key === name).map((e) => +e.t.toFixed(1));
            console.log('[onyxStats] ' + name + ' fired ' + hits.length + 'x at ms:', hits.join(', '));
            return hits;
        },
        filter(substring) {
            const out = [];
            for (const [key, count] of s.keyChanged) {
                if (key.includes(substring)) {
                    out.push({key, count, via: 'keyChanged'});
                }
            }
            for (const [key, count] of s.memberKeys) {
                if (key.includes(substring)) {
                    out.push({key, count, via: 'collectionMember'});
                }
            }
            out.sort((a, b) => b.count - a.count);
            console.table(out);
            return out;
        },
        json() {
            return JSON.stringify(
                {
                    totalKeyChanged: s.totalKeyChanged,
                    totalKeysChanged: s.totalKeysChanged,
                    totalMembers: s.totalMembers,
                    spanMs: s.events.length ? +s.events[s.events.length - 1].t.toFixed(1) : 0,
                    keyChanged: Object.fromEntries(s.keyChanged),
                    memberKeys: Object.fromEntries(s.memberKeys),
                    keysChanged: Object.fromEntries(s.keysChanged),
                    events: s.events.map((e) => ({ms: +e.t.toFixed(1), kind: e.kind, key: e.key, extra: e.extra})),
                },
                null,
                2,
            );
        },
    };
    console.log('[onyxStats] installed — reset() / timeline() / gaps() / dump() / key(name) / json()');
})();
${END}
`;

const wrap = (body) => `${HIT} try { const __s = globalThis.__onyxStats && globalThis.__onyxStats._s; if (__s) { ${body} } } catch (e) {}`;

const ANCHORS = [
    {
        signature: 'function keyChanged(key, value, canUpdateSubscriber = () => true, isProcessingCollectionUpdate = false) {',
        inject: wrap("__s.totalKeyChanged++; __s.keyChanged.set(key, (__s.keyChanged.get(key) || 0) + 1); __s.push('key', key);"),
    },
    {
        signature: 'function keysChanged(collectionKey, partialCollection, partialPreviousCollection) {',
        inject: wrap(
            '__s.totalKeysChanged++; __s.keysChanged.set(collectionKey, (__s.keysChanged.get(collectionKey) || 0) + 1); ' +
                'const __mk = Object.keys(partialCollection || {}); __s.totalMembers += __mk.length; ' +
                'for (const __k of __mk) { __s.memberKeys.set(__k, (__s.memberKeys.get(__k) || 0) + 1); } ' +
                "__s.push('collection', collectionKey, __mk.length + ' members');",
        ),
    },
];

function targetFile(checkout) {
    return path.join(checkout, 'node_modules', 'react-native-onyx', 'dist', 'OnyxUtils.js');
}

function status(checkout) {
    const file = targetFile(checkout);
    if (!fs.existsSync(file)) {
        return {checkout, state: 'MISSING', file};
    }
    const text = fs.readFileSync(file, 'utf8');
    const hits = text.split(HIT).length - 1;
    return {checkout, state: text.includes(BEGIN) ? `instrumented (${hits}/2 hooks)` : 'clean', file};
}

function uninstall(checkout) {
    const file = targetFile(checkout);
    let text = fs.readFileSync(file, 'utf8');
    if (!text.includes(BEGIN)) {
        return 'already clean';
    }
    const esc = (str) => str.replaceAll(/[*/]/g, '\\$&');
    // Consume the surrounding newlines too, so removal restores the file byte-for-byte.
    text = text.replace(new RegExp(`\\n*${esc(BEGIN)}[\\s\\S]*?${esc(END)}\\n*`), '\n');
    text = text
        .split('\n')
        .filter((line) => !line.includes(HIT))
        .join('\n');
    fs.writeFileSync(file, text);
    return 'removed';
}

function install(checkout) {
    const file = targetFile(checkout);
    if (!fs.existsSync(file)) {
        throw new Error(`not found: ${file}`);
    }
    let text = fs.readFileSync(file, 'utf8');
    if (text.includes(BEGIN)) {
        return 'already instrumented';
    }

    for (const {signature, inject} of ANCHORS) {
        if (!text.includes(signature)) {
            throw new Error(`anchor not found in ${file}:\n  ${signature}`);
        }
        text = text.replace(signature, `${signature}\n    ${inject}`);
    }

    // Prelude goes after the "use strict" prologue so it runs before any notification can fire.
    const marker = '"use strict";';
    text = text.includes(marker) ? text.replace(marker, `${marker}\n${PRELUDE.trimEnd()}`) : `${PRELUDE.trimEnd()}\n${text}`;

    fs.writeFileSync(file, text);
    return 'instrumented';
}

const args = process.argv.slice(2);
let mode = 'install';
if (args.includes('--uninstall')) {
    mode = 'uninstall';
} else if (args.includes('--status')) {
    mode = 'status';
}
const checkouts = args.filter((a) => !a.startsWith('--'));

if (checkouts.length === 0) {
    console.error('usage: node instrumentOnyxCounters.mjs [--uninstall|--status] <checkout> [<checkout> ...]');
    process.exit(1);
}

for (const checkout of checkouts) {
    try {
        if (mode === 'status') {
            const s = status(checkout);
            console.log(`${s.state.padEnd(26)} ${s.checkout}`);
        } else {
            const result = mode === 'install' ? install(checkout) : uninstall(checkout);
            console.log(`${result.padEnd(26)} ${checkout}`);
        }
    } catch (error) {
        console.error(`FAILED ${checkout}: ${error.message}`);
        process.exitCode = 1;
    }
}
