import {afterEach, describe, expect, it} from 'bun:test';

import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

import type {LintMessage, SeatbeltOptions} from '../../scripts/lint/types';

import {applySeatbelt, canonicalizeMessages, parseSeatbeltTSV, serializeSeatbeltTSV, transformMessages} from '../../scripts/lint/processors/Seatbelt';

function makeOptions(overrides: Partial<SeatbeltOptions> = {}): SeatbeltOptions {
    return {
        seatbeltFile: '/tmp/config/eslint/eslint.seatbelt.tsv',
        projectRoot: '/tmp',
        disable: false,
        frozen: false,
        readOnly: true,
        allowIncreaseRules: new Set(),
        keepRules: new Set(),
        quiet: false,
        verbose: false,
        ...overrides,
    };
}

function makeMessage(ruleID: string, overrides: Partial<LintMessage> = {}): LintMessage {
    return {
        filePath: '/tmp/src/file.ts',
        ruleID,
        severity: 2,
        message: `Original: ${ruleID}`,
        line: 1,
        column: 1,
        ...overrides,
    };
}

describe('canonicalizeMessages', () => {
    it('sorts by filename, ruleID, line, then column', () => {
        const messages = [
            makeMessage('b', {filePath: '/z.ts', line: 2, column: 1}),
            makeMessage('a', {filePath: '/a.ts', line: 9, column: 1}),
            makeMessage('a', {filePath: '/a.ts', line: 1, column: 9}),
            makeMessage('a', {filePath: '/a.ts', line: 1, column: 1}),
        ];
        expect(canonicalizeMessages(messages).map((message) => `${message.filePath}:${message.ruleID}:${message.line}:${message.column}`)).toEqual([
            '/a.ts:a:1:1',
            '/a.ts:a:1:9',
            '/a.ts:a:9:1',
            '/z.ts:b:2:1',
        ]);
    });
});

describe('transformMessages', () => {
    it('demotes errors at the baseline to warnings', () => {
        const {data} = parseSeatbeltTSV(`"../../src/file.ts"\t"no-console"\t2\n`);
        const result = transformMessages(makeOptions(), data, '/tmp/src/file.ts', [makeMessage('no-console'), makeMessage('no-console', {line: 2})]);
        expect(result).toHaveLength(2);
        expect(result.at(0)?.severity).toBe(1);
        expect(result.at(0)?.message).toContain('tend the garden');
    });

    it('keeps overflow errors as errors', () => {
        const {data} = parseSeatbeltTSV(`"../../src/file.ts"\t"no-console"\t1\n`);
        const result = transformMessages(makeOptions(), data, '/tmp/src/file.ts', [
            makeMessage('no-console', {line: 1}),
            makeMessage('no-console', {line: 2}),
            makeMessage('no-console', {line: 3}),
        ]);
        expect(result.filter((message) => message.severity === 2)).toHaveLength(2);
        expect(result.filter((message) => message.severity === 1)).toHaveLength(1);
        expect(result.at(-1)?.message).toContain('Remove');
    });

    it('demotes the first N overflow occurrences, not an arbitrary subset', () => {
        const {data} = parseSeatbeltTSV(`"../../src/file.ts"\t"no-console"\t1\n`);
        const result = transformMessages(makeOptions(), data, '/tmp/src/file.ts', [makeMessage('no-console', {line: 10}), makeMessage('no-console', {line: 20})]);
        expect(result.at(0)?.severity).toBe(1);
        expect(result.at(0)?.line).toBe(10);
        expect(result.at(1)?.severity).toBe(2);
        expect(result.at(1)?.line).toBe(20);
    });

    it('quiet suppresses at-max warnings but keeps overflow errors', () => {
        const {data} = parseSeatbeltTSV(`"../../src/file.ts"\t"no-console"\t1\n`);
        const result = transformMessages(makeOptions({quiet: true}), data, '/tmp/src/file.ts', [makeMessage('no-console', {line: 1}), makeMessage('no-console', {line: 2})]);
        expect(result).toHaveLength(1);
        expect(result.at(0)?.severity).toBe(2);
    });

    it('frozen turns a decrease into a warning rather than writing', () => {
        const {data} = parseSeatbeltTSV(`"../../src/file.ts"\t"no-console"\t5\n`);
        const result = transformMessages(makeOptions({frozen: true}), data, '/tmp/src/file.ts', [makeMessage('no-console'), makeMessage('no-console', {line: 2})]);
        expect(result.at(0)?.severity).toBe(1);
        expect(result.at(0)?.message).toContain('SEATBELT_FROZEN');
        expect(result.at(0)?.message).toContain('eslint.seatbelt.tsv');
        expect(result.at(0)?.message).not.toContain('/tmp/src/file.ts');
    });

    it('leaves unbaselined rules untouched', () => {
        const {data} = parseSeatbeltTSV(`"../../src/file.ts"\t"no-console"\t1\n`);
        const result = transformMessages(makeOptions(), data, '/tmp/src/file.ts', [makeMessage('no-debugger')]);
        expect(result).toEqual([makeMessage('no-debugger')]);
    });
});

describe('serializeSeatbeltTSV', () => {
    it('round-trips the committed header and row format', () => {
        const original = `# eslint-seatbelt temporarily allowed errors
# docs: https://github.com/justjake/eslint-seatbelt#readme

"../../src/a.ts"	"no-console"	1
"../../src/b.ts"	"@typescript-eslint/no-deprecated/Foo"	2
`;
        const {data, comments} = parseSeatbeltTSV(original);
        // Force reserialization through the maxErrors map (the write path).
        for (const fileState of data.values()) {
            fileState.maxErrors = new Map(fileState.lines.map((line) => [line.ruleID, line.maxErrors]));
        }
        expect(serializeSeatbeltTSV(data, comments)).toBe(original);
    });
});

describe('applySeatbelt', () => {
    const dirs: string[] = [];

    afterEach(async () => {
        await Promise.all(dirs.splice(0).map((dir) => rm(dir, {recursive: true, force: true})));
    });

    async function tempDir(): Promise<string> {
        const dir = await mkdtemp(path.join(tmpdir(), 'lint-seatbelt-'));
        dirs.push(dir);
        return dir;
    }

    it('does not write in readOnly mode when counts go down', async () => {
        const dir = await tempDir();
        await writeFile(path.join(dir, 'src.ts'), 'x\n');
        const tsvPath = path.join(dir, 'eslint.seatbelt.tsv');
        const tsv = `"src.ts"\t"no-console"\t2\n`;
        await writeFile(tsvPath, tsv);

        const result = await applySeatbelt([makeMessage('no-console', {filePath: path.join(dir, 'src.ts')})], makeOptions({seatbeltFile: tsvPath, projectRoot: dir, readOnly: true}), [
            path.join(dir, 'src.ts'),
        ]);

        expect(result.wrote).toBe(false);
        expect(result.changed).toBe(true);
        expect(await Bun.file(tsvPath).text()).toBe(tsv);
    });

    it('writes a tightened TSV when readOnly is off', async () => {
        const dir = await tempDir();
        await writeFile(path.join(dir, 'src.ts'), 'x\n');
        const tsvPath = path.join(dir, 'eslint.seatbelt.tsv');
        await writeFile(tsvPath, `"src.ts"\t"no-console"\t2\n`);

        const result = await applySeatbelt([makeMessage('no-console', {filePath: path.join(dir, 'src.ts')})], makeOptions({seatbeltFile: tsvPath, projectRoot: dir, readOnly: false}), [
            path.join(dir, 'src.ts'),
        ]);

        expect(result.wrote).toBe(true);
        expect(result.tsv).toContain('"src.ts"\t"no-console"\t1');
        expect(await Bun.file(tsvPath).text()).toBe(result.tsv);
    });

    it('fails an increase without SEATBELT_INCREASE and does not write', async () => {
        const dir = await tempDir();
        await writeFile(path.join(dir, 'src.ts'), 'x\n');
        const tsvPath = path.join(dir, 'eslint.seatbelt.tsv');
        const original = `"src.ts"\t"no-console"\t1\n`;
        await writeFile(tsvPath, original);

        const result = await applySeatbelt(
            [makeMessage('no-console', {filePath: path.join(dir, 'src.ts'), line: 1}), makeMessage('no-console', {filePath: path.join(dir, 'src.ts'), line: 2})],
            makeOptions({seatbeltFile: tsvPath, projectRoot: dir, readOnly: false}),
            [path.join(dir, 'src.ts')],
        );

        expect(result.wrote).toBe(false);
        expect(result.messages.some((message) => message.severity === 2 && message.message.includes('Remove'))).toBe(true);
        expect(await Bun.file(tsvPath).text()).toBe(original);
    });

    it('allows an increase when SEATBELT_INCREASE names the rule', async () => {
        const dir = await tempDir();
        await writeFile(path.join(dir, 'src.ts'), 'x\n');
        const tsvPath = path.join(dir, 'eslint.seatbelt.tsv');
        await writeFile(tsvPath, `"src.ts"\t"no-console"\t1\n`);

        const result = await applySeatbelt(
            [makeMessage('no-console', {filePath: path.join(dir, 'src.ts'), line: 1}), makeMessage('no-console', {filePath: path.join(dir, 'src.ts'), line: 2})],
            makeOptions({seatbeltFile: tsvPath, projectRoot: dir, readOnly: false, allowIncreaseRules: new Set(['no-console'])}),
            [path.join(dir, 'src.ts')],
        );

        expect(result.wrote).toBe(true);
        expect(result.tsv).toContain('"src.ts"\t"no-console"\t2');
        expect(result.messages.every((message) => message.severity === 1)).toBe(true);
    });

    it('prunes rows for deleted files on the write path', async () => {
        const dir = await tempDir();
        await writeFile(path.join(dir, 'kept.ts'), 'x\n');
        const tsvPath = path.join(dir, 'eslint.seatbelt.tsv');
        await writeFile(tsvPath, `"gone.ts"\t"no-console"\t1\n"kept.ts"\t"no-console"\t1\n`);

        const result = await applySeatbelt([makeMessage('no-console', {filePath: path.join(dir, 'kept.ts')})], makeOptions({seatbeltFile: tsvPath, projectRoot: dir, readOnly: false}), [
            path.join(dir, 'kept.ts'),
        ]);

        expect(result.wrote).toBe(true);
        expect(result.tsv).not.toContain('gone.ts');
        expect(result.tsv).toContain('kept.ts');
    });

    it('does not prune deleted-file rows when frozen', async () => {
        const dir = await tempDir();
        await writeFile(path.join(dir, 'kept.ts'), 'x\n');
        const tsvPath = path.join(dir, 'eslint.seatbelt.tsv');
        const original = `"gone.ts"\t"no-console"\t1\n"kept.ts"\t"no-console"\t1\n`;
        await writeFile(tsvPath, original);

        const result = await applySeatbelt(
            [makeMessage('no-console', {filePath: path.join(dir, 'kept.ts')})],
            makeOptions({seatbeltFile: tsvPath, projectRoot: dir, frozen: true, readOnly: false}),
            [path.join(dir, 'kept.ts')],
        );

        expect(result.wrote).toBe(false);
        expect(await Bun.file(tsvPath).text()).toBe(original);
    });

    it('names the TSV path when a frozen run drops a rule entirely', async () => {
        const dir = await tempDir();
        await writeFile(path.join(dir, 'kept.ts'), 'x\n');
        const tsvPath = path.join(dir, 'eslint.seatbelt.tsv');
        await writeFile(tsvPath, `"kept.ts"\t"no-console"\t1\n`);

        const result = await applySeatbelt([], makeOptions({seatbeltFile: tsvPath, projectRoot: dir, frozen: true, readOnly: false}), [path.join(dir, 'kept.ts')]);

        expect(result.messages.some((message) => message.message.includes(tsvPath) && message.message.includes('SEATBELT_FROZEN'))).toBe(true);
        expect(result.messages.some((message) => message.message.includes('kept.ts') && !message.message.includes(tsvPath))).toBe(false);
    });

    it('is a no-op when SEATBELT_DISABLE is set', async () => {
        const dir = await tempDir();
        const tsvPath = path.join(dir, 'eslint.seatbelt.tsv');
        await writeFile(tsvPath, `"src.ts"\t"no-console"\t1\n`);
        const incoming = [makeMessage('no-console')];
        const result = await applySeatbelt(incoming, makeOptions({seatbeltFile: tsvPath, disable: true}), ['/tmp/src/file.ts']);
        expect(result.messages).toBe(incoming);
        expect(result.wrote).toBe(false);
    });
});
