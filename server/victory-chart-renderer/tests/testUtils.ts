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

const FIXTURE_EXPECTED_SIZES = new Map<string, {width: number; height: number}>([
    ['monthly-spend', {width: 680, height: 430}],
    ['top-categories-6', {width: 680, height: 530}],
    ['top-categories-6-label-indicators', {width: 680, height: 530}],
    ['top-categories-10', {width: 680, height: 610}],
    ['top-employees-by-spend', {width: 680, height: 464}],
    ['top-employees-by-spend-truncated-labels', {width: 680, height: 464}],
    ['bar-chart-labels-fit', {width: 680, height: 430}],
    ['bar-chart-labels-diagonal', {width: 680, height: 480}],
    ['bar-chart-labels-horizontal', {width: 680, height: 720}],
    ['search-merchants-by-spend-horizontal', {width: 680, height: 936}],
]);

type PngPixel = {
    r: number;
    g: number;
    b: number;
    a: number;
};

function getPixel(img: PNG, x: number, y: number): PngPixel {
    const index = (img.width * y + x) * 4;
    return {
        r: img.data[index],
        g: img.data[index + 1],
        b: img.data[index + 2],
        a: img.data[index + 3],
    };
}

function assertOpaqueCardBackground(img: PNG) {
    const corners: Array<[number, number]> = [
        [0, 0],
        [img.width - 1, 0],
        [0, img.height - 1],
        [img.width - 1, img.height - 1],
    ];

    for (const [x, y] of corners) {
        const pixel = getPixel(img, x, y);
        expect(pixel.a).toBe(255);
        expect(pixel.r > 230).toBe(true);
        expect(pixel.g > 230).toBe(true);
        expect(pixel.b > 220).toBe(true);
    }
}

function assertTitleBandHasDarkPixels(img: PNG) {
    let hasDarkTitlePixel = false;

    for (let y = 35; y <= 50; y++) {
        for (let x = 32; x < 250; x++) {
            const pixel = getPixel(img, x, y);
            if (pixel.a > 200 && pixel.r + pixel.g + pixel.b < 150) {
                hasDarkTitlePixel = true;
                break;
            }
        }

        if (hasDarkTitlePixel) {
            break;
        }
    }

    expect(hasDarkTitlePixel).toBe(true);
}

function assertEmailChartPngQuality(img: PNG, fixtureName: string) {
    assertOpaqueCardBackground(img);

    if (fixtureName.includes('top-categories')) {
        return;
    }

    assertTitleBandHasDarkPixels(img);
}

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

function comparePng(actualPath: string, goldenPath: string, expectedSize?: {width: number; height: number}, fixtureName?: string) {
    const actual = PNG.sync.read(readFileSync(actualPath));
    const golden = PNG.sync.read(readFileSync(goldenPath));

    if (expectedSize) {
        expect(actual.width).toBe(expectedSize.width);
        expect(actual.height).toBe(expectedSize.height);
    }

    expect(actual.width).toBe(golden.width);
    expect(actual.height).toBe(golden.height);

    if (fixtureName) {
        assertEmailChartPngQuality(actual, fixtureName);
    }

    const diff = new PNG({width: actual.width, height: actual.height});
    const mismatchedPixels = pixelmatch(actual.data, golden.data, diff.data, actual.width, actual.height, {
        threshold: 0.1,
    });

    const maxAllowedMismatch = Math.ceil(actual.width * actual.height * 0.001);
    expect(mismatchedPixels).toBeLessThanOrEqual(maxAllowedMismatch);
}

export {comparePng, fixturesDir, FIXTURE_EXPECTED_SIZES, FIXTURE_NAMES, getLocalCompileTarget, goldenDir, packageRoot};
