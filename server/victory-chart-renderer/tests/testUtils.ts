import {expect} from 'bun:test';
import {readdirSync, readFileSync} from 'node:fs';
import {arch, platform} from 'node:os';
import {join} from 'node:path';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

const packageRoot = join(import.meta.dir, '..');

const fixturesDir = join(import.meta.dir, 'fixtures');
const goldenDir = join(import.meta.dir, '__golden__');

const FIXTURE_NAMES = readdirSync(fixturesDir)
    .filter((name) => name.endsWith('.xml') && !name.startsWith('missing-dimensions'))
    .map((name) => name.replace(/\.xml$/, ''));

const FIXTURE_EXPECTED_SIZES: Record<string, {width: number; height: number}> = {
    'monthly-spend': {width: 680, height: 430},
    'top-categories-6': {width: 680, height: 530},
    'top-categories-10': {width: 680, height: 610},
    'top-employees-by-spend': {width: 680, height: 464},
};

function getLocalCompileTarget(): string {
    const hostPlatform = platform();
    const hostArch = arch();

    if (hostPlatform === 'darwin') {
        return hostArch === 'arm64' ? 'bun-darwin-arm64' : 'bun-darwin-x64';
    }

    if (hostPlatform === 'linux') {
        return hostArch === 'arm64' ? 'bun-linux-arm64' : 'bun-linux-x64';
    }

    throw new Error(`Standalone binary tests are not supported on ${hostPlatform} (${hostArch})`);
}

function comparePng(actualPath: string, goldenPath: string, expectedSize?: {width: number; height: number}) {
    const actual = PNG.sync.read(readFileSync(actualPath));
    const golden = PNG.sync.read(readFileSync(goldenPath));

    if (expectedSize) {
        expect(actual.width).toBe(expectedSize.width);
        expect(actual.height).toBe(expectedSize.height);
    }

    expect(actual.width).toBe(golden.width);
    expect(actual.height).toBe(golden.height);

    const diff = new PNG({width: actual.width, height: actual.height});
    const mismatchedPixels = pixelmatch(actual.data, golden.data, diff.data, actual.width, actual.height, {
        threshold: 0.1,
    });

    const maxAllowedMismatch = Math.floor(actual.width * actual.height * 0.001);
    expect(mismatchedPixels).toBeLessThanOrEqual(maxAllowedMismatch);
}

export {comparePng, fixturesDir, FIXTURE_EXPECTED_SIZES, FIXTURE_NAMES, getLocalCompileTarget, goldenDir, packageRoot};
