import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {copyFileSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

const repoRoot = join(import.meta.dir, '../../..');
const goldenPath = join(import.meta.dir, '__golden__/smoke.png');

const EXPECTED_WIDTH = 400;
const EXPECTED_HEIGHT = 250;

// Set `UPDATE_GOLDEN=1` while running the test to refresh the reference PNG.
// Intentionally separate from the comparison flow so a regression can't quietly
// rewrite the golden.
const SHOULD_UPDATE_GOLDEN = process.env.UPDATE_GOLDEN === '1';

test('CLI renders a chart whose PNG matches the golden reference', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'vcr-smoke-'));
    const actualPath = join(tempDir, 'smoke-actual.png');

    try {
        const result = spawnSync('npm', ['run', 'dev', '-w', '@expensify/victory-chart-renderer', '--', '--outPath', actualPath], {
            cwd: repoRoot,
            encoding: 'utf8',
        });

        expect(result.status).toBe(0);

        if (SHOULD_UPDATE_GOLDEN) {
            copyFileSync(actualPath, goldenPath);
        }

        const actual = PNG.sync.read(readFileSync(actualPath));
        const golden = PNG.sync.read(readFileSync(goldenPath));

        expect(actual.width).toBe(EXPECTED_WIDTH);
        expect(actual.height).toBe(EXPECTED_HEIGHT);
        expect(golden.width).toBe(EXPECTED_WIDTH);
        expect(golden.height).toBe(EXPECTED_HEIGHT);

        const diff = new PNG({width: EXPECTED_WIDTH, height: EXPECTED_HEIGHT});
        const mismatchedPixels = pixelmatch(actual.data, golden.data, diff.data, EXPECTED_WIDTH, EXPECTED_HEIGHT, {
            threshold: 0.1,
        });

        // Allow a tiny number of antialiasing-driven pixel differences without making the test brittle.
        const maxAllowedMismatch = Math.floor(EXPECTED_WIDTH * EXPECTED_HEIGHT * 0.001);
        expect(mismatchedPixels).toBeLessThanOrEqual(maxAllowedMismatch);
    } finally {
        rmSync(tempDir, {recursive: true, force: true});
    }
});

// Sanity-check that the golden lives where we expect; this keeps an
// accidentally-deleted reference from looking like a passing test.
test('golden reference PNG exists on disk', () => {
    expect(() => readFileSync(goldenPath)).not.toThrow();
});
