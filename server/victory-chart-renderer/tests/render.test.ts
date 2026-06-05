import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

const packageRoot = join(import.meta.dir, '..');
const repoRoot = join(packageRoot, '../..');
const fixturesDir = join(import.meta.dir, 'fixtures');
const goldenDir = join(import.meta.dir, '__golden__');
const outputDir = join(import.meta.dir, '__output__');

const SHOULD_UPDATE_GOLDEN = process.env.UPDATE_GOLDEN === '1';
const FIXTURE_NAMES = readdirSync(fixturesDir)
    .filter((name) => name.endsWith('.xml') && !name.startsWith('missing-dimensions'))
    .map((name) => name.replace(/\.xml$/, ''));

function runCli(xmlPath: string, outPath: string) {
    const chartXML = readFileSync(xmlPath, 'utf8');
    return spawnSync('npm', ['run', 'dev', '-w', '@expensify/victory-chart-renderer', '--', '--chart-xml', chartXML, '--out', outPath], {
        cwd: repoRoot,
        encoding: 'utf8',
    });
}

function comparePng(actualPath: string, goldenPath: string) {
    const actual = PNG.sync.read(readFileSync(actualPath));
    const golden = PNG.sync.read(readFileSync(goldenPath));

    expect(actual.width).toBe(golden.width);
    expect(actual.height).toBe(golden.height);

    const diff = new PNG({width: actual.width, height: actual.height});
    const mismatchedPixels = pixelmatch(actual.data, golden.data, diff.data, actual.width, actual.height, {
        threshold: 0.1,
    });

    const maxAllowedMismatch = Math.floor(actual.width * actual.height * 0.001);
    expect(mismatchedPixels).toBeLessThanOrEqual(maxAllowedMismatch);
}

for (const fixtureName of FIXTURE_NAMES) {
    test(`renders ${fixtureName} matching golden PNG`, () => {
        const xmlPath = join(fixturesDir, `${fixtureName}.xml`);
        const goldenPath = join(goldenDir, `${fixtureName}.png`);
        const actualPath = join(outputDir, `${fixtureName}.png`);

        const result = runCli(xmlPath, actualPath);
        expect(result.status).toBe(0);

        if (SHOULD_UPDATE_GOLDEN) {
            copyFileSync(actualPath, goldenPath);
        }

        comparePng(actualPath, goldenPath);
    });
}

test('missing dimensions overlay exits with actionable error', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'vcr-negative-'));
    const actualPath = join(tempDir, 'negative.png');

    try {
        const result = runCli(join(fixturesDir, 'missing-dimensions-overlay.xml'), actualPath);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain('require explicit width and height');
        expect(existsSync(actualPath)).toBe(false);
    } finally {
        rmSync(tempDir, {recursive: true, force: true});
    }
});
