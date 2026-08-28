import {afterEach, describe, expect, it} from 'bun:test';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type {BundleSizeReport} from '../../scripts/bundleSize';

import {measure, parseReport, render, ReportValidationError} from '../../scripts/bundleSize';

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

    /** The five cache groups `config/rsbuild/rsbuild.common.ts` splits out, as a real build emits them. */
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

    it('measures a build that emits every expected cache group', () => {
        const measured = measure(dist(emitted()), BASE_SHA);

        expect(Object.keys(measured.chunks).sort()).toEqual(['expensifyIcons', 'heicTo', 'illustrations', 'main', 'vendors']);
        expect(measured.initialJsRaw).toBe(2048 + 4096);
    });

    it('fails when a cache group has been renamed away, rather than reporting no change for it', () => {
        expect(() => measure(dist(without('illustrations-dddddddd.bundle.js')), BASE_SHA)).toThrow(/no chunk named illustrations/);
    });

    it('refuses to measure a dist with no index.html, which would read as a large improvement', () => {
        expect(() => measure(dist(without('index.html')), BASE_SHA)).toThrow(/nothing was built/);
    });
});
