import {afterEach, beforeEach, describe, expect, it} from 'bun:test';

import type {JsonObject} from 'type-fest';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import fixLottieAssets, {changeFrameRate, fixLottieFile, removeFullSizeCircleMattes, removeVisibleFlagFromMattes} from '../../scripts/fixLottieAssets';
import ZipUtils from '../../scripts/utils/ZipUtils';

const ANIMATIONS_DIRECTORY = path.resolve(import.meta.dirname, '../../assets/animations');

// Size of the composition of the Concierge avatars
const SIZE = 550;

const IDENTITY_TRANSFORM = {a: {a: 0, k: [0, 0]}, p: {a: 0, k: [0, 0]}, s: {a: 0, k: [100, 100]}, r: {a: 0, k: 0}, o: {a: 0, k: 100}};

type EllipseMatteOptions = {
    diameter?: number;

    /** Defaults to the center of the composition */
    layerPosition?: number[];

    /** The scale property of the layer, which defaults to a static 100% */
    layerScale?: JsonObject;

    /** Fields that are added to the layer, or that replace the ones it has */
    layerFields?: JsonObject;
};

/** A matte layer made of one filled ellipse, which is the full-size circle of the composition with the default options. */
function createEllipseMatte(
    index: number,
    {diameter = SIZE, layerPosition = [SIZE / 2, SIZE / 2], layerScale = IDENTITY_TRANSFORM.s, layerFields = {}}: EllipseMatteOptions = {},
): JsonObject {
    return {
        ind: index,
        ty: 4,
        td: 1,
        ip: 0,
        op: 96,
        st: 0,
        ks: {...IDENTITY_TRANSFORM, p: {a: 0, k: layerPosition}, s: layerScale},
        shapes: [
            {
                ty: 'gr',
                it: [
                    {ty: 'el', s: {a: 0, k: [diameter, diameter]}, p: {a: 0, k: [0, 0]}},
                    {ty: 'fl', c: {a: 0, k: [0, 0, 0]}, o: {a: 0, k: 100}},
                    {ty: 'tr', ...IDENTITY_TRANSFORM},
                ],
            },
        ],
        ...layerFields,
    };
}

/** A matte layer made of a path, like the eye-shaped mattes of the Concierge avatars. */
function createPathMatte(index: number): JsonObject {
    return {
        ...createEllipseMatte(index),
        shapes: [
            {
                ty: 'gr',
                it: [
                    {ty: 'sh', ks: {a: 0, k: {c: true, v: [], i: [], o: []}}},
                    {ty: 'fl', c: {a: 0, k: [0, 0, 0]}, o: {a: 0, k: 100}},
                    {ty: 'tr', ...IDENTITY_TRANSFORM},
                ],
            },
        ],
    };
}

function createLayer(index: number, extra: JsonObject = {}): JsonObject {
    return {ind: index, ty: 4, ip: 0, op: 96, st: 0, ks: IDENTITY_TRANSFORM, shapes: [], ...extra};
}

function createAnimation(layers: JsonObject[], extra: JsonObject = {}): JsonObject {
    return {v: '5.9.0', fr: 24, ip: 0, op: 96, w: SIZE, h: SIZE, layers, ...extra};
}

describe('removeFullSizeCircleMattes', () => {
    it('removes a matte that is the circle of the composition and shows the matted layer directly', () => {
        // Given a layer that is shown through a full-size circle, which is what the avatar view already clips to
        const animation = createAnimation([createEllipseMatte(1), createLayer(2, {tt: 1, tp: 1, nm: 'background'}), createLayer(3)]);

        // When the redundant mattes are removed
        const fixedAnimation = removeFullSizeCircleMattes(animation);

        // Then the matte is gone and the layer no longer refers to it, otherwise players would matte it with whichever layer now sits above it
        expect(fixedAnimation.layers).toEqual([createLayer(2, {nm: 'background'}), createLayer(3)]);
    });

    it('keeps the mattes that change what is drawn', () => {
        // Given mattes that are not the avatar circle for the whole life of their layer: an eye shape, a smaller circle, a circle that is off center, a scaled circle,
        // a circle that grows over time, a circle that ends before its layer does, a hidden circle and a circle in 3D
        const growingScale = {
            a: 1,
            k: [
                {t: 0, s: [0, 0]},
                {t: 96, s: [100, 100]},
            ],
        };
        const mattes = [
            createPathMatte(1),
            createEllipseMatte(3, {diameter: 200}),
            createEllipseMatte(5, {layerPosition: [0, 0]}),
            createEllipseMatte(7, {layerScale: {a: 0, k: [50, 50]}}),
            createEllipseMatte(9, {layerScale: growingScale}),
            createEllipseMatte(11, {layerFields: {op: 48}}),
            createEllipseMatte(13, {layerFields: {hd: true}}),
            createEllipseMatte(15, {layerFields: {ddd: 1}}),
        ];
        const animation = createAnimation(mattes.flatMap((matte, index) => [matte, createLayer(index * 2 + 2, {tt: 1})]));

        // When the redundant mattes are removed
        const fixedAnimation = removeFullSizeCircleMattes(animation);

        // Then nothing changes, because removing any of these would show parts of the layers, or moments of them, that the design hides
        expect(fixedAnimation).toEqual(animation);
    });

    it('keeps a full-size circle that is used for something else than an alpha matte', () => {
        // Given a full-size circle used as an inverted matte, which hides the layer instead of showing it, one that another layer is parented to,
        // and one that its own layer is parented to
        const animation = createAnimation([
            createEllipseMatte(1),
            createLayer(2, {tt: 2}),
            createEllipseMatte(3),
            createLayer(4, {tt: 1}),
            createLayer(5, {parent: 3}),
            createEllipseMatte(6),
            createLayer(7, {tt: 1, parent: 6}),
        ]);

        // When the redundant mattes are removed
        const fixedAnimation = removeFullSizeCircleMattes(animation);

        // Then they all stay, because the first one is not redundant and removing the others would leave a layer without the parent that positions it
        expect(fixedAnimation).toEqual(animation);
    });
});

describe('removeVisibleFlagFromMattes', () => {
    it('removes the explicit "hd": false of matte layers only', () => {
        // Given matte layers with an explicit "hd": false in the animation and in a nested composition, next to layers whose "hd" must not change
        const animation = createAnimation([createLayer(1, {td: 1, hd: false}), createLayer(2, {tt: 1, hd: false})], {
            assets: [
                {id: 'image_0', p: 'image.png'},
                {id: 'comp_0', layers: [createLayer(1, {td: 1, hd: false}), createLayer(2, {tt: 1}), createLayer(3, {td: 1, hd: true})]},
            ],
        });

        // When the flag is removed
        const fixedAnimation = removeVisibleFlagFromMattes(animation);

        // Then only the visible mattes lost their key, which is what makes Skottie hide them like the other players do
        expect(fixedAnimation).toEqual(
            createAnimation([createLayer(1, {td: 1}), createLayer(2, {tt: 1, hd: false})], {
                assets: [
                    {id: 'image_0', p: 'image.png'},
                    {id: 'comp_0', layers: [createLayer(1, {td: 1}), createLayer(2, {tt: 1}), createLayer(3, {td: 1, hd: true})]},
                ],
            }),
        );
    });
});

describe('changeFrameRate', () => {
    it('converts every time and keeps the speed of the animation', () => {
        // Given 689 frames at 69 fps, like Desk, with an animated layer in a nested composition, a time remap whose values are in seconds and a marker
        const position = {
            a: 1,
            k: [
                {t: 69, s: [0, 0]},
                {t: 345, s: [100, 0]},
            ],
        };
        const timeRemap = {
            a: 1,
            k: [
                {t: 0, s: [0]},
                {t: 689, s: [9.98]},
            ],
        };
        const animation = createAnimation([createLayer(1, {ty: 0, refId: 'comp_0', op: 689, tm: timeRemap})], {
            fr: 69,
            op: 689,
            assets: [{id: 'comp_0', fr: 24, layers: [createLayer(1, {ip: 138, op: 689, st: 23, ks: {...IDENTITY_TRANSFORM, p: position}})]}],
            markers: [{cm: 'second 5', tm: 345, dr: 69}],
        });

        // When it is brought down to 24 fps
        const fixedAnimation = changeFrameRate(animation, 24);

        // Then each time is at the same moment as before: second 1 is frame 24 instead of 69, second 5 is frame 120 instead of 345
        const convertedOutPoint = (689 * 24) / 69;
        const convertedTimeRemap = {
            a: 1,
            k: [
                {t: 0, s: [0]},
                {t: convertedOutPoint, s: [9.98]},
            ],
        };
        const convertedPosition = {
            a: 1,
            k: [
                {t: 24, s: [0, 0]},
                {t: 120, s: [100, 0]},
            ],
        };
        expect(fixedAnimation).toEqual(
            createAnimation([createLayer(1, {ty: 0, refId: 'comp_0', op: convertedOutPoint, tm: convertedTimeRemap})], {
                fr: 24,
                op: 239,
                assets: [{id: 'comp_0', fr: 24, layers: [createLayer(1, {ip: 48, op: convertedOutPoint, st: 8, ks: {...IDENTITY_TRANSFORM, p: convertedPosition}})]}],
                markers: [{cm: 'second 5', tm: 120, dr: 24}],
            }),
        );
    });

    it('ends the composition on a whole frame that its layers still cover', () => {
        // Given a layer that lasts as long as its composition, 689 frames at 69 fps, which is 239.65 frames at 24 fps
        const animation = createAnimation([createLayer(1, {op: 689})], {fr: 69, op: 689});

        // When it is brought down to 24 fps
        const fixedAnimation = changeFrameRate(animation, 24);

        // Then the composition ends on frame 239 and not 240. Players hide a layer after its out point, so a composition
        // that ends later than its layers shows nothing for the last moment of every loop.
        expect(fixedAnimation.op).toBe(239);
        expect(fixedAnimation.layers).toEqual([createLayer(1, {op: (689 * 24) / 69})]);
    });

    it('leaves an animation that is already at the frame rate as it is', () => {
        // Given an animation at 24 fps
        const animation = createAnimation([createLayer(1)]);

        // When it is converted to 24 fps
        const fixedAnimation = changeFrameRate(animation, 24);

        // Then it is returned untouched, so that running the script again on a fixed file does not rewrite it
        expect(fixedAnimation).toBe(animation);
    });
});

describe('fixLottieFile', () => {
    let directory: string;
    let filePath: string;
    const manifest = Buffer.from('{"version":"1","animations":[{"id":"data"}]}');
    const fixes = [{description: 'removed the circle mattes', apply: removeFullSizeCircleMattes}];

    beforeEach(() => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'fixLottieAssets-'));
        filePath = path.join(directory, 'Avatar.lottie');
        const animation = createAnimation([createEllipseMatte(1), createLayer(2, {tt: 1})]);
        fs.writeFileSync(
            filePath,
            ZipUtils.write([
                {name: 'manifest.json', data: manifest},
                {name: 'animations/data.json', data: Buffer.from(JSON.stringify(animation))},
            ]),
        );
    });

    afterEach(() => {
        fs.rmSync(directory, {recursive: true, force: true});
    });

    it('rewrites the animation and keeps the rest of the archive', () => {
        // Given a .lottie file whose animation needs a fix
        // When the file is fixed
        const appliedFixes = fixLottieFile(filePath, fixes);

        // Then the fix is reported, the animation is rewritten, and the manifest that the players read the animation id from is untouched
        expect(appliedFixes).toEqual(['removed the circle mattes']);
        expect(ZipUtils.read(fs.readFileSync(filePath))).toEqual([
            {name: 'manifest.json', data: manifest},
            {name: 'animations/data.json', data: Buffer.from(JSON.stringify(createAnimation([createLayer(2)])))},
        ]);
    });

    it('does not touch a file that is already fixed', () => {
        // Given a file that was fixed once
        fixLottieFile(filePath, fixes);
        const fixedFile = fs.readFileSync(filePath);

        // When it is fixed again
        const appliedFixes = fixLottieFile(filePath, fixes);

        // Then nothing is reported and the file is byte for byte the same, so the script can be run on every asset at any time
        expect(appliedFixes).toEqual([]);
        expect(fs.readFileSync(filePath).equals(fixedFile)).toBe(true);
    });

    it('only reports the fixes when it is asked not to write', () => {
        // Given a .lottie file whose animation needs a fix
        const originalFile = fs.readFileSync(filePath);

        // When it is checked without writing, which is what `--check` does
        const appliedFixes = fixLottieFile(filePath, fixes, false);

        // Then the fix is reported but the file on disk is left as it was
        expect(appliedFixes).toEqual(['removed the circle mattes']);
        expect(fs.readFileSync(filePath).equals(originalFile)).toBe(true);
    });
});

describe('fixLottieAssets', () => {
    it('finds nothing to fix in the animations of the app', () => {
        // Given the animations that are committed in the repository
        // When the script checks them without writing
        const assetsToFix = fixLottieAssets(ANIMATIONS_DIRECTORY, false).filter((asset) => asset.appliedFixes.length > 0);

        // Then none of them needs a fix. If this fails after an animation was exported again, run `npm run fix-lottie-assets` and commit the result.
        expect(assetsToFix).toEqual([]);
    });
});
