import {expect, test} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const projectRoot = join(import.meta.dir, '../../..');
const cliPath = join(projectRoot, 'server/victory-chart-renderer/src/cli.ts');

test('CLI writes the scaffold message to outPath', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'vcr-cli-test-'));
    const outPath = join(tempDir, 'out.txt');

    try {
        const result = spawnSync('bun', ['run', cliPath, outPath], {
            cwd: projectRoot,
            encoding: 'utf8',
        });

        expect(result.status).toBe(0);
        expect(readFileSync(outPath, 'utf8')).toBe('victory-chart-renderer scaffolded\n');
    } finally {
        rmSync(tempDir, {recursive: true, force: true});
    }
});
