import {afterAll, beforeAll, expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {chmodSync, copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {comparePng, FIXTURE_EXPECTED_SIZES, FIXTURE_NAMES, fixturesDir, getLocalCompileTarget, goldenDir, packageRoot} from './testUtils';

const SHOULD_UPDATE_GOLDEN = process.env.UPDATE_GOLDEN === '1';
const isolatedRunDir = mkdtempSync(join(tmpdir(), 'vcr-standalone-run-'));
const binaryPath = join(isolatedRunDir, 'victory-chart-renderer');

beforeAll(() => {
    const compileTarget = getLocalCompileTarget();
    const buildResult = spawnSync('bun', ['run', 'scripts/build.ts', '--target', compileTarget, '--outfile', binaryPath], {
        cwd: packageRoot,
        encoding: 'utf8',
    });

    if (buildResult.status !== 0) {
        throw new Error(`Failed to compile standalone binary:\n${buildResult.stderr}\n${buildResult.stdout}`);
    }

    if (!existsSync(binaryPath)) {
        throw new Error(`Compiled binary is missing at ${binaryPath}`);
    }

    chmodSync(binaryPath, 0o755);
}, 120_000);

afterAll(() => {
    rmSync(isolatedRunDir, {recursive: true, force: true});
});

function runBinary(chartXML: string, outPath: string) {
    return spawnSync(binaryPath, ['--chart-xml', chartXML, '--out', outPath], {
        cwd: isolatedRunDir,
        encoding: 'utf8',
    });
}

test('golden fixture suite includes all expected charts', () => {
    expect(FIXTURE_NAMES.length).toBe(4);
});

for (const fixtureName of FIXTURE_NAMES) {
    test(`renders ${fixtureName} matching golden PNG`, () => {
        const xmlPath = join(fixturesDir, `${fixtureName}.xml`);
        const goldenPath = join(goldenDir, `${fixtureName}.png`);
        const actualPath = join(isolatedRunDir, `${fixtureName}.png`);
        const chartXML = readFileSync(xmlPath, 'utf8');

        const result = runBinary(chartXML, actualPath);

        expect(result.status).toBe(0);
        expect(existsSync(actualPath)).toBe(true);

        if (SHOULD_UPDATE_GOLDEN) {
            copyFileSync(actualPath, goldenPath);
        }

        comparePng(actualPath, goldenPath, FIXTURE_EXPECTED_SIZES.get(fixtureName));
    });
}

test('rejects missing dimensions overlay', () => {
    const xmlPath = join(fixturesDir, 'missing-dimensions-overlay.xml');
    const actualPath = join(isolatedRunDir, 'negative.png');
    const chartXML = readFileSync(xmlPath, 'utf8');

    const result = runBinary(chartXML, actualPath);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('require explicit width and height');
    expect(existsSync(actualPath)).toBe(false);
});
