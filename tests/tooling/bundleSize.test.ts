import {afterEach, describe, expect, it} from 'bun:test';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type {BundleSizeReport} from '../../scripts/bundleSize';

import {assertComparable, measure, parseReport, render, ReportValidationError} from '../../scripts/bundleSize';

/** Mirrors the cap in `scripts/bundleSize.ts`, which is not exported because nothing else needs it. */
const MAX_CHUNKS = 1000;

const BASE_SHA = 'f864be0d0a1aaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const HEAD_SHA = 'c9ddb071902bbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

function chunk(raw: number, gzip: number, initial = false) {
    return {raw, gzip, initial};
}

function report(overrides: Partial<BundleSizeReport> = {}): BundleSizeReport {
    return {
        sha: BASE_SHA,
        measuredWith: 'node v26.5.0',
        initialJsRaw: 15_013_707,
        initialJsGzip: 3_956_687,
        allJsRaw: 40_446_752,
        allJsGzip: 11_294_052,
        cssRaw: 40_000,
        cssGzip: 9_096,
        largestChunk: {name: 'vendors', raw: 9_726_213, gzip: 1_862_657},
        chunks: {
            main: chunk(6_000_000, 1_476_017, true),
            vendors: chunk(9_726_213, 1_862_657, true),
            heicTo: chunk(2_000_000, 618_013, true),
            illustrations: chunk(3_000_000, 793_177),
            expensifyIcons: chunk(400_000, 94_273),
        },
        ...overrides,
    };
}

describe('render', () => {
    it('reports a chunk the pull request added rather than leaving it out', () => {
        const base = report();
        const head = report({sha: HEAD_SHA, chunks: {...base.chunks, newFeature: chunk(800_000, 250_000, true)}});

        const comment = render(head, {kind: 'merge-base', report: base}, 'main');

        expect(comment).toContain('| newFeature (gzip) | 250.00 kB | - | New file |');
        // Once in the headline table and once in the collapsed block: an added chunk is not a detail.
        expect(comment.split('| newFeature (gzip) | 250.00 kB | - | New file |')).toHaveLength(3);
    });

    it('reports a chunk the pull request deleted, which head alone cannot see', () => {
        const base = report();
        const head = report({sha: HEAD_SHA, chunks: {main: base.chunks.main, vendors: base.chunks.vendors, heicTo: base.chunks.heicTo, expensifyIcons: base.chunks.expensifyIcons}});

        const comment = render(head, {kind: 'merge-base', report: base}, 'main');

        expect(comment).toContain('| illustrations (gzip) | - | 793.18 kB | Deleted |');
        expect(comment).not.toContain('| illustrations (gzip) | 793.18 kB | 793.18 kB | no change |');
    });

    it('never renders an absent side as a size of zero', () => {
        const base = report();
        const head = report({sha: HEAD_SHA, chunks: {...base.chunks, newFeature: chunk(800_000, 250_000, true)}});

        const comment = render(head, {kind: 'merge-base', report: base}, 'main');

        expect(comment).not.toContain('| newFeature (gzip) | 250.00 kB | 0 B |');
    });

    it('keeps a below-floor chunk out of the headline and in the collapsed block', () => {
        const base = report();
        const head = report({sha: HEAD_SHA, chunks: {...base.chunks, main: chunk(6_000_100, 1_476_117, true)}});

        const [headline, collapsed] = render(head, {kind: 'merge-base', report: base}, 'main').split('<details>');

        expect(headline).not.toContain('main (gzip)');
        expect(collapsed).toContain('| main (gzip) | 1.48 MB | 1.48 MB | +100 B');
    });

    it('promotes a chunk that moved past the floor', () => {
        const base = report();
        const head = report({sha: HEAD_SHA, chunks: {...base.chunks, main: chunk(6_100_000, 1_500_000, true)}});

        const [headline] = render(head, {kind: 'merge-base', report: base}, 'main').split('<details>');

        expect(headline).toContain('| main (gzip) | 1.50 MB | 1.48 MB | +23.98 kB (+1.62%) |');
    });

    it('names the merge base it compared against', () => {
        const comment = render(report({sha: HEAD_SHA}), {kind: 'merge-base', report: report()}, 'main');

        expect(comment).toContain(`against \`main\` at \`${BASE_SHA.slice(0, 11)}\`, this pull request's merge base.`);
    });

    it('says which commit stood in when the merge base itself was not measured', () => {
        const mergeBaseSha = 'ab12cd34ef5ccccccccccccccccccccccccccccc';
        const comment = render(report({sha: HEAD_SHA}), {kind: 'ancestor', report: report(), mergeBaseSha}, 'main');

        expect(comment).toContain(`merge base \`${mergeBaseSha.slice(0, 11)}\` has no measurement`);
        expect(comment).toContain('carries whatever landed on `main` between those two commits');
    });

    it('drops the percentage when the baseline side is zero, rather than rendering Infinity', () => {
        const base = report({cssGzip: 0});
        const head = report({sha: HEAD_SHA, cssGzip: 2_000});

        const comment = render(head, {kind: 'merge-base', report: base}, 'main');

        expect(comment).toContain('| emitted CSS (gzip) | 2.00 kB | 0 B | +2.00 kB |');
        expect(comment).not.toContain('Infinity');
    });

    it('does not report a largest-chunk identity change between two numeric chunk ids', () => {
        const base = report({largestChunk: {name: '4821', raw: 9_726_213, gzip: 1_862_657}});
        const head = report({sha: HEAD_SHA, largestChunk: {name: '7233', raw: 9_726_213, gzip: 1_862_657}});

        expect(render(head, {kind: 'merge-base', report: base}, 'main')).not.toContain('changed identity');
    });

    it('reports a largest-chunk identity change between two names a reader knows', () => {
        const head = report({sha: HEAD_SHA, largestChunk: {name: 'main', raw: 9_726_213, gzip: 1_862_657}});

        expect(render(head, {kind: 'merge-base', report: report()}, 'main')).toContain('changed identity (`vendors` -> `main`)');
    });

    it('renders one-value rows with no baseline, so nothing reads as a delta of zero', () => {
        const comment = render(report({sha: HEAD_SHA}), {kind: 'missing'}, 'main');

        expect(comment).toContain('No `main` measurement resolved');
        expect(comment).not.toContain('no change');
    });
});

describe('size formatting', () => {
    function changeFor(headGzip: number, baseGzip: number): string {
        const base = report();
        const head = report({sha: HEAD_SHA, chunks: {...base.chunks, main: chunk(1, headGzip, true)}});
        const line = render(head, {kind: 'merge-base', report: {...base, chunks: {...base.chunks, main: chunk(1, baseGzip, true)}}}, 'main')
            .split('\n')
            .find((row) => row.startsWith('| main (gzip)'));
        return line ?? '';
    }

    it('keeps a sub-kilobyte change in bytes, which is the range the noise floor lives in', () => {
        expect(changeFor(1_000_016, 1_000_000)).toContain('| +16 B ');
    });

    it('scales a kilobyte-sized change to kB', () => {
        expect(changeFor(1_320_939, 1_000_000)).toContain('| +320.94 kB ');
    });

    it('scales a megabyte-sized value to MB', () => {
        expect(changeFor(15_334_646, 1_000)).toContain('| 15.33 MB |');
    });

    it('scales a negative change too', () => {
        expect(changeFor(1_000_000, 1_320_939)).toContain('| -320.94 kB ');
    });
});

describe('assertComparable', () => {
    it('refuses a bun measurement against a node one, which would read the compressor as a code change', () => {
        expect(() => assertComparable(report({measuredWith: 'bun 1.3.14'}), report({sha: HEAD_SHA}))).toThrow(/different runtimes/);
    });

    it('allows two measurements from the same runtime at different versions', () => {
        expect(() => assertComparable(report({measuredWith: 'node v26.5.0'}), report({sha: HEAD_SHA, measuredWith: 'node v26.6.0'}))).not.toThrow();
    });

    it('allows a report written before the runtime was recorded, rather than failing every old artifact', () => {
        expect(() => assertComparable(report({measuredWith: undefined}), report({sha: HEAD_SHA}))).not.toThrow();
    });
});

describe('parseReport', () => {
    /** Deliberately typed as `unknown`: these are the shapes a build could write, not shapes the code allows. */
    function malformed(overrides: Record<string, unknown>): unknown {
        return {...report(), ...overrides};
    }

    function chunksNamed(name: string): Record<string, unknown> {
        return {chunks: Object.fromEntries([[name, chunk(1, 1)]])};
    }

    it('accepts a measurement the build produces', () => {
        expect(() => parseReport(report(), 'head')).not.toThrow();
    });

    it('returns only the fields it checked, so nothing unchecked can reach the comment', () => {
        const parsed = parseReport(malformed({smuggled: '<script>'}), 'head');

        expect(Object.keys(parsed)).not.toContain('smuggled');
    });

    it.each([
        ['a commit SHA that is not one', malformed({sha: 'not-a-sha; rm -rf /'})],
        ['a size that is not a number', malformed({allJsGzip: 'lots'})],
        ['a negative size', malformed({allJsRaw: -1})],
        ['a size that is not finite', malformed({initialJsGzip: Number.NaN})],
        ['a size that is null', malformed({cssGzip: null})],
        ['a runtime string that is not one', malformed({measuredWith: '`); rm -rf /'})],
        ['a chunk name carrying markdown', malformed(chunksNamed('x | 0 B |\n| [click](https://evil.example)'))],
        ['a chunk name with a path traversal', malformed(chunksNamed('../../etc/passwd'))],
        ['a chunk name that is an absolute path', malformed(chunksNamed('/etc/passwd'))],
        ['a chunk that is not an object', malformed({chunks: {main: 12}})],
        ['a chunk that does not say whether it is initial', malformed({chunks: {main: {raw: 1, gzip: 1}}})],
        ['more chunks than the comment renders', malformed({chunks: Object.fromEntries(Array.from({length: MAX_CHUNKS + 1}, (unused, index) => [`c${index}`, chunk(1, 1)]))})],
        ['no chunks at all', malformed({chunks: undefined})],
        ['no largest chunk', malformed({largestChunk: undefined})],
    ])('refuses %s', (unused, value) => {
        expect(() => parseReport(value, 'head')).toThrow(ReportValidationError);
    });

    it('refuses an array, which JSON allows and the renderer does not', () => {
        expect(() => parseReport([], 'head')).toThrow(ReportValidationError);
    });

    it('keeps a chunk named __proto__, which assigning key by key would swallow instead', () => {
        // `CHUNK_NAME_PATTERN` allows it, and `JSON.parse` hands it over as an own property, so it has to
        // come out the other side as an ordinary key rather than silently vanishing into a prototype setter.
        const parsed = parseReport(malformed(chunksNamed('__proto__')), 'head');

        expect(Object.keys(parsed.chunks)).toContain('__proto__');
    });
});

describe('measure', () => {
    const created: string[] = [];

    function dist(files: Array<[string, string]>): string {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-size-'));
        created.push(dir);
        for (const [name, contents] of files) {
            fs.writeFileSync(path.join(dir, name), contents);
        }
        return dir;
    }

    /** The entry chunk and the four cache groups a real build emits, named as the build names them. */
    function emitted(): Array<[string, string]> {
        return [
            ['index.html', '<script src="/main-aaaaaaaa.bundle.js"></script><script src="/vendors-bbbbbbbb.bundle.js"></script>'],
            ['main-aaaaaaaa.bundle.js', 'a'.repeat(2048)],
            ['vendors-bbbbbbbb.bundle.js', 'b'.repeat(4096)],
            ['heicTo-cccccccc.bundle.js', 'c'.repeat(512)],
            ['illustrations-dddddddd.bundle.js', 'd'.repeat(512)],
            ['expensifyIcons-eeeeeeee.bundle.js', 'e'.repeat(512)],
        ];
    }

    function without(name: string): Array<[string, string]> {
        return emitted().filter(([file]) => file !== name);
    }

    afterEach(() => {
        for (const dir of created.splice(0)) {
            fs.rmSync(dir, {recursive: true, force: true});
        }
    });

    it('measures a build that emits every expected chunk name', () => {
        const measured = measure(dist(emitted()), BASE_SHA);

        expect(Object.keys(measured.chunks).sort()).toEqual(['expensifyIcons', 'heicTo', 'illustrations', 'main', 'vendors']);
        expect(measured.initialJsRaw).toBe(2048 + 4096);
    });

    it('classifies a chunk index.html does not load as off the initial path', () => {
        const measured = measure(dist(emitted()), BASE_SHA);

        expect(measured.chunks.main.initial).toBe(true);
        expect(measured.chunks.heicTo.initial).toBe(false);
    });

    it('picks the largest chunk by raw bytes, which is what the headline promotion rule reads', () => {
        expect(measure(dist(emitted()), BASE_SHA).largestChunk.name).toBe('vendors');
    });

    it('refuses a stale dist where two files measure as one chunk, which would count both and show one', () => {
        const stale = [...emitted(), ['main-ffffffff.bundle.js', 'f'.repeat(1024)] as [string, string]];

        expect(() => measure(dist(stale), BASE_SHA)).toThrow(/both measure as chunk main/);
    });

    it('fails when an expected chunk has been renamed away, rather than reporting no change for it', () => {
        expect(() => measure(dist(without('illustrations-dddddddd.bundle.js')), BASE_SHA)).toThrow(/no chunk named illustrations/);
    });

    it('refuses to measure a dist with no index.html, which would read as a large improvement', () => {
        expect(() => measure(dist(without('index.html')), BASE_SHA)).toThrow(/nothing was built/);
    });
});
