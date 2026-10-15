import assert from 'node:assert/strict';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, test} from 'node:test';

import carryForwardPreviousBuilds from '../scripts/carryForwardPreviousBuilds.ts';

function writeFiles(rootDir: string, files: Record<string, string>) {
    for (const [filePath, contents] of Object.entries(files)) {
        const absolutePath = path.join(rootDir, filePath);
        mkdirSync(path.dirname(absolutePath), {recursive: true});
        writeFileSync(absolutePath, contents);
    }
}

describe('carryForwardPreviousBuilds', () => {
    let tempDir: string;
    let currentBuild: string;
    let previousBuild: string;

    beforeEach(() => {
        tempDir = mkdtempSync(path.join(tmpdir(), 'carry-forward-'));
        currentBuild = path.join(tempDir, 'current');
        previousBuild = path.join(tempDir, 'previous');
        writeFiles(currentBuild, {
            'index.html': 'current shell',
            'main-1111111111111111.bundle.js': 'current chunk',
            'version.json': '{"version":"2"}',
        });
    });

    afterEach(() => {
        rmSync(tempDir, {recursive: true, force: true});
    });

    test('adds files from a previous build that the current build no longer has', () => {
        // Given a previous build whose chunks an open tab may still request
        writeFiles(previousBuild, {
            'main-0000000000000000.bundle.js': 'old chunk',
            'css/old.0123456789.css': 'old nested style',
        });

        // When it is carried forward
        const copiedCount = carryForwardPreviousBuilds(currentBuild, [previousBuild]);

        // Then both files are added, so the tab can still load them after the deploy
        assert.equal(copiedCount, 2);
        assert.equal(readFileSync(path.join(currentBuild, 'main-0000000000000000.bundle.js'), 'utf8'), 'old chunk');
        assert.equal(readFileSync(path.join(currentBuild, 'css/old.0123456789.css'), 'utf8'), 'old nested style');
    });

    test('never replaces a file from the current build', () => {
        // Given a previous build with its own copies of files that keep the same name across builds
        writeFiles(previousBuild, {'index.html': 'old shell', 'version.json': '{"version":"1"}'});

        // When it is carried forward
        const copiedCount = carryForwardPreviousBuilds(currentBuild, [previousBuild]);

        // Then the current versions stay, otherwise the deploy would serve the previous build's shell and version
        assert.equal(copiedCount, 0);
        assert.equal(readFileSync(path.join(currentBuild, 'index.html'), 'utf8'), 'current shell');
        assert.equal(readFileSync(path.join(currentBuild, 'version.json'), 'utf8'), '{"version":"2"}');
    });

    test('skips Brotli twins and source maps', () => {
        // Given a previous build containing files that are never published
        writeFiles(previousBuild, {'main-0000000000000000.bundle.js.br': 'twin', 'main-0000000000000000.bundle.js.map': 'map'});

        // When it is carried forward
        const copiedCount = carryForwardPreviousBuilds(currentBuild, [previousBuild]);

        // Then they are left behind instead of being copied only to be ignored on upload
        assert.equal(copiedCount, 0);
        assert.equal(existsSync(path.join(currentBuild, 'main-0000000000000000.bundle.js.br')), false);
        assert.equal(existsSync(path.join(currentBuild, 'main-0000000000000000.bundle.js.map')), false);
    });

    test('takes each file from the first build that has it', () => {
        // Given two previous builds that both contain a file the current build lacks
        const olderBuild = path.join(tempDir, 'older');
        writeFiles(previousBuild, {'module-a.0123456789.js': 'newer'});
        writeFiles(olderBuild, {'module-a.0123456789.js': 'older', 'module-b.0123456789.js': 'only in older'});

        // When they are carried forward, newest first
        const copiedCount = carryForwardPreviousBuilds(currentBuild, [previousBuild, olderBuild]);

        // Then the shared file comes from the newer build and is copied once
        assert.equal(copiedCount, 2);
        assert.equal(readFileSync(path.join(currentBuild, 'module-a.0123456789.js'), 'utf8'), 'newer');
        assert.equal(readFileSync(path.join(currentBuild, 'module-b.0123456789.js'), 'utf8'), 'only in older');
    });
});
