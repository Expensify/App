/**
 * Rewrites the Lottie animations in `assets/animations` that are expensive to play because of how they were exported,
 * whichever player renders them. Run `npm run fix-lottie-assets` after Design re-exports one of the files listed in
 * `ASSET_FIXES`. A file that is already fixed is left untouched, so the script can be run at any time.
 */
import type {JsonObject, JsonValue} from 'type-fest';

import * as fs from 'fs';
import * as path from 'path';

import ZipUtils from './utils/ZipUtils';

type LottieFix = {
    /** Printed by the CLI next to each file the fix changed */
    description: string;
    apply: (animation: JsonObject) => JsonObject;
};

type FixedAsset = {
    fileName: string;

    /** Descriptions of the fixes that changed the file, empty when the file was already fixed */
    appliedFixes: string[];
};

// Value of a layer's `ty` for a shape layer
const SHAPE_LAYER_TYPE = 4;

// Value of a layer's `tt` when the layer is shown through the alpha channel of its matte
const ALPHA_MATTE_MODE = 1;

// Values of a shape item's `ty`
const SHAPE_ITEM_TYPE = {
    GROUP: 'gr',
    ELLIPSE: 'el',
    FILL: 'fl',
    TRANSFORM: 'tr',
} as const;

// A matte made of anything else (a path, a stroke, a trim path) is not a plain filled circle
const CIRCLE_MATTE_ITEM_TYPES = new Set<JsonValue | undefined>(Object.values(SHAPE_ITEM_TYPE));

// The in point, out point and start time of a layer, in frames
const LAYER_TIME_KEYS = new Set(['ip', 'op', 'st']);

// The start and the duration of a marker, in frames. Markers are the only times that are stored outside of the layers.
const MARKER_TIME_KEYS = new Set(['tm', 'dr']);

// The keys that link a layer to its matte: the matte mode and the index of the matte layer
const MATTE_LINK_KEYS = new Set(['tt', 'tp']);

// The key that hides a layer
const HIDDEN_KEYS = new Set(['hd']);

// Sizes and positions are compared with this tolerance, in composition pixels
const GEOMETRY_TOLERANCE = 1;

const FULL_SCALE = 100;
const FULL_OPACITY = 100;

// Desk was exported at 69 fps, which makes a player that redraws on every frame of the animation, like dotLottie, draw it 69 times a second
const DESK_FRAME_RATE = 24;

// Each .lottie file stores its animation under this folder
const ANIMATION_ENTRY_PREFIX = 'animations/';

function isJsonObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value: JsonValue | undefined): value is number {
    return typeof value === 'number';
}

function isNonEmptyArray(value: JsonValue | undefined): boolean {
    return Array.isArray(value) && value.length > 0;
}

function omitKeys(object: JsonObject, keys: Set<string>): JsonObject {
    return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.has(key)));
}

function getLayers(composition: JsonObject): JsonObject[] {
    return Array.isArray(composition.layers) ? composition.layers.filter(isJsonObject) : [];
}

/** Applies `rewrite` to the animation and to each of its nested compositions, which Lottie stores as assets that have layers. */
function mapCompositions(animation: JsonObject, rewrite: (composition: JsonObject) => JsonObject): JsonObject {
    const rewrittenAnimation = rewrite(animation);
    if (!Array.isArray(animation.assets)) {
        return rewrittenAnimation;
    }
    return {...rewrittenAnimation, assets: animation.assets.map((asset) => (isJsonObject(asset) && 'layers' in asset ? rewrite(asset) : asset))};
}

/** An animated property stores a list of keyframes that each carry a time `t`, a static one stores the value itself. */
function isAnimated(property: JsonValue | undefined): boolean {
    if (!isJsonObject(property) || !Array.isArray(property.k)) {
        return false;
    }
    const firstKeyframe = property.k.at(0);
    return isJsonObject(firstKeyframe) && 't' in firstKeyframe;
}

/** Returns the value of a property that is not animated, as a list of numbers because Lottie stores a scalar as a bare number. */
function getStaticNumbers(property: JsonValue | undefined): number[] | undefined {
    if (!isJsonObject(property)) {
        return undefined;
    }
    const value = isNumber(property.k) ? [property.k] : property.k;
    return Array.isArray(value) && value.every(isNumber) ? value : undefined;
}

/** Whether a property is static and equal to `expected` on every axis. A property that is left out has its default value, which is the one we expect here. */
function hasStaticValue(property: JsonValue | undefined, expected: number): boolean {
    if (property === undefined) {
        return true;
    }
    return getStaticNumbers(property)?.every((value) => value === expected) ?? false;
}

/** Returns a static 2D point, `[0, 0]` when the property is left out, or undefined when it is animated. */
function getStaticPoint(property: JsonValue | undefined): [number, number] | undefined {
    if (property === undefined) {
        return [0, 0];
    }
    const [x, y] = getStaticNumbers(property) ?? [];
    return x === undefined || y === undefined ? undefined : [x, y];
}

/**
 * Returns how far a transform moves its content, or undefined when it does anything other than move it (scale,
 * rotation, skew, opacity or keyframes).
 */
function getTranslation(transform: JsonValue | undefined): [number, number] | undefined {
    if (!isJsonObject(transform)) {
        return undefined;
    }
    const position = getStaticPoint(transform.p);
    const anchor = getStaticPoint(transform.a);
    const onlyMoves = hasStaticValue(transform.s, FULL_SCALE) && hasStaticValue(transform.o, FULL_OPACITY) && hasStaticValue(transform.r, 0) && hasStaticValue(transform.sk, 0);
    if (!position || !anchor || !onlyMoves) {
        return undefined;
    }
    return [position[0] - anchor[0], position[1] - anchor[1]];
}

/** Returns the items of a shape layer with the content of its groups inlined. */
function flattenShapeItems(items: JsonValue | undefined): JsonObject[] {
    if (!Array.isArray(items)) {
        return [];
    }
    return items.filter(isJsonObject).flatMap((item) => [item, ...flattenShapeItems(item.it)]);
}

/**
 * Whether a matte layer is nothing but a static, opaque ellipse that covers the composition, like the circle that most
 * layers of the Concierge avatars are matted with.
 */
function isFullSizeCircleMatte(layer: JsonObject, width: number, height: number): boolean {
    // A matte that is itself matted, parented, hidden, in 3D, masked or behind an effect is more than the shape it contains
    const isPlainShapeLayer =
        layer.ty === SHAPE_LAYER_TYPE && !('tt' in layer) && !('parent' in layer) && !layer.hd && !layer.ddd && !isNonEmptyArray(layer.masksProperties) && !isNonEmptyArray(layer.ef);
    if (!layer.td || !isPlainShapeLayer) {
        return false;
    }

    const items = flattenShapeItems(layer.shapes);
    const ellipses = items.filter((item) => item.ty === SHAPE_ITEM_TYPE.ELLIPSE);
    const fills = items.filter((item) => item.ty === SHAPE_ITEM_TYPE.FILL);
    const ellipse = ellipses.at(0);
    const isOpaque = fills.length > 0 && fills.every((fill) => hasStaticValue(fill.o, FULL_OPACITY));
    if (!ellipse || ellipses.length !== 1 || !isOpaque || !items.every((item) => CIRCLE_MATTE_ITEM_TYPES.has(item.ty) && !item.hd)) {
        return false;
    }

    const size = getStaticPoint(ellipse.s);
    const center = getStaticPoint(ellipse.p);
    if (!size || !center) {
        return false;
    }
    for (const transform of [layer.ks, ...items.filter((item) => item.ty === SHAPE_ITEM_TYPE.TRANSFORM)]) {
        const translation = getTranslation(transform);
        if (!translation) {
            return false;
        }
        center[0] += translation[0];
        center[1] += translation[1];
    }

    return [size[0] - width, size[1] - height, center[0] - width / 2, center[1] - height / 2].every((difference) => Math.abs(difference) < GEOMETRY_TOLERANCE);
}

/**
 * Removes the alpha mattes that are the full-size circle of the composition, and keeps every other matte. This is only
 * correct for an animation whose view is already clipped to that circle, which `ConciergeAnimatedAvatar` does. Each
 * matte is an offscreen layer for the player, and lottie-android renders the whole animation in software on the UI
 * thread when it has more than four mattes or masks.
 */
function removeFullSizeCircleMattes(animation: JsonObject): JsonObject {
    const {w: width, h: height} = animation;
    if (!isNumber(width) || !isNumber(height)) {
        return animation;
    }

    const layers = getLayers(animation);
    const removedMattes = new Set<JsonObject>();
    const layersToUnlink = new Set<JsonObject>();
    for (const [index, matte] of layers.entries()) {
        // A matte applies to the layer that follows it, unless that layer picks another matte by index with `tp`
        const mattedLayer = layers.at(index + 1);
        if (mattedLayer?.tt !== ALPHA_MATTE_MODE || (mattedLayer.tp !== undefined && mattedLayer.tp !== matte.ind)) {
            continue;
        }

        // A layer is hidden while its matte is not active, so the matte is only redundant when it lasts at least as long as the layer
        const coversMattedLayer =
            isNumber(matte.ip) && isNumber(matte.op) && isNumber(mattedLayer.ip) && isNumber(mattedLayer.op) && matte.ip <= mattedLayer.ip && matte.op >= mattedLayer.op;

        // Removing a matte that a layer is parented to, or that another layer picked as its matte, would break that layer
        const isUsedElsewhere = matte.ind !== undefined && layers.some((layer) => layer.parent === matte.ind || (layer !== mattedLayer && layer.tp === matte.ind));

        if (coversMattedLayer && !isUsedElsewhere && isFullSizeCircleMatte(matte, width, height)) {
            removedMattes.add(matte);
            layersToUnlink.add(mattedLayer);
        }
    }

    return {
        ...animation,
        layers: layers.filter((layer) => !removedMattes.has(layer)).map((layer) => (layersToUnlink.has(layer) ? omitKeys(layer, MATTE_LINK_KEYS) : layer)),
    };
}

/**
 * Removes the explicit `"hd": false` of the matte layers, in the animation and in its nested compositions. Skottie only
 * hides a matte layer that has no `hd` key, so it draws these mattes as visible shapes. Every other player hides them
 * either way.
 */
function removeVisibleFlagFromMattes(animation: JsonObject): JsonObject {
    return mapCompositions(animation, (composition) => ({
        ...composition,
        layers: getLayers(composition).map((layer) => (layer.td && layer.hd === false ? omitKeys(layer, HIDDEN_KEYS) : layer)),
    }));
}

/** Returns a copy of a layer, or of anything inside it, with every layer time and keyframe time converted by `convertTime`. */
function convertTimes(node: JsonValue, convertTime: (time: number) => number): JsonValue {
    if (Array.isArray(node)) {
        return node.map((child) => convertTimes(child, convertTime));
    }
    if (!isJsonObject(node)) {
        return node;
    }

    // Layers are the only objects with a numeric type, shape items have a string one
    const isLayer = isNumber(node.ty);
    const hasKeyframes = isAnimated(node);
    return Object.fromEntries(
        Object.entries(node).map(([key, value]) => {
            if (isLayer && LAYER_TIME_KEYS.has(key) && isNumber(value)) {
                return [key, convertTime(value)];
            }
            if (key === 'k' && hasKeyframes && Array.isArray(value)) {
                return [key, value.map((keyframe) => (isJsonObject(keyframe) && isNumber(keyframe.t) ? {...keyframe, t: convertTime(keyframe.t)} : keyframe))];
            }
            return [key, convertTimes(value, convertTime)];
        }),
    );
}

/**
 * Changes the frame rate of an animation without changing its speed: every time, which Lottie stores in frames, is
 * converted to the new rate. The values of a time remap are in seconds, so they stay as they are.
 */
function changeFrameRate(animation: JsonObject, frameRate: number): JsonObject {
    const {fr: sourceFrameRate, ip: inPoint, op: outPoint} = animation;
    if (!isNumber(sourceFrameRate) || !isNumber(inPoint) || !isNumber(outPoint) || sourceFrameRate <= 0) {
        throw new Error('The animation has no frame rate or no duration');
    }
    if (sourceFrameRate === frameRate) {
        return animation;
    }

    const convertTime = (time: number) => (time * frameRate) / sourceFrameRate;
    const convertedAnimation = mapCompositions(animation, (composition) => ({
        ...composition,
        layers: getLayers(composition).map((layer) => convertTimes(layer, convertTime)),
        fr: frameRate,
    }));
    const convertMarker = (marker: JsonValue) =>
        isJsonObject(marker) ? Object.fromEntries(Object.entries(marker).map(([key, value]) => [key, MARKER_TIME_KEYS.has(key) && isNumber(value) ? convertTime(value) : value])) : marker;
    return {
        ...convertedAnimation,
        ip: convertTime(inPoint),

        // The out point is brought to a whole frame by rounding down. Rounded up, the composition would outlast its
        // layers, and players would draw nothing between the end of the layers and the end of each loop.
        op: Math.floor(convertTime(outPoint)),
        ...(Array.isArray(animation.markers) && {markers: animation.markers.map(convertMarker)}),
    };
}

const REMOVE_FULL_SIZE_CIRCLE_MATTES: LottieFix = {description: 'removed the mattes that are the full-size avatar circle', apply: removeFullSizeCircleMattes};

// The fixes of each animation, keyed by the name of its .lottie file and listed in the order they are applied
const ASSET_FIXES: Record<string, LottieFix[]> = {
    ConciergeThinkingScanGradient: [REMOVE_FULL_SIZE_CIRCLE_MATTES],
    ConciergeThinkingScanOuterGlow: [REMOVE_FULL_SIZE_CIRCLE_MATTES],
    ConciergeThinkingHypnotized: [REMOVE_FULL_SIZE_CIRCLE_MATTES],
    Desk: [
        {description: 'removed the explicit "hd": false of the matte layers', apply: removeVisibleFlagFromMattes},
        {description: `changed the frame rate to ${DESK_FRAME_RATE} fps`, apply: (animation) => changeFrameRate(animation, DESK_FRAME_RATE)},
    ],
};

/**
 * Applies the fixes to the animation of a .lottie file, which is a zip archive of a manifest and the animation JSON.
 *
 * @param shouldWrite - false to only report which fixes the file needs
 * @returns the descriptions of the fixes that changed the animation
 */
function fixLottieFile(filePath: string, fixes: LottieFix[], shouldWrite = true): string[] {
    const entries = ZipUtils.read(fs.readFileSync(filePath));
    const animationEntries = entries.filter((entry) => entry.name.startsWith(ANIMATION_ENTRY_PREFIX) && entry.name.endsWith('.json'));
    const animationEntry = animationEntries.at(0);
    if (!animationEntry || animationEntries.length !== 1) {
        throw new Error(`Expected one animation in ${filePath}, found ${animationEntries.length}`);
    }

    const parsedAnimation: unknown = JSON.parse(animationEntry.data.toString('utf8'));
    if (!isJsonObject(parsedAnimation)) {
        throw new Error(`The animation of ${filePath} is not a JSON object`);
    }

    // The fixes return a copy of the animation, so a fix changed something when the serialized animation differs
    let animation = parsedAnimation;
    let serializedAnimation = JSON.stringify(animation);
    const appliedFixes: string[] = [];
    for (const fix of fixes) {
        animation = fix.apply(animation);
        const serializedFixedAnimation = JSON.stringify(animation);
        if (serializedFixedAnimation !== serializedAnimation) {
            appliedFixes.push(fix.description);
        }
        serializedAnimation = serializedFixedAnimation;
    }

    if (shouldWrite && appliedFixes.length > 0) {
        const fixedEntry = {...animationEntry, data: Buffer.from(serializedAnimation, 'utf8')};
        fs.writeFileSync(filePath, ZipUtils.write(entries.map((entry) => (entry === animationEntry ? fixedEntry : entry))));
    }
    return appliedFixes;
}

/**
 * Applies the fixes of `ASSET_FIXES` to the files of a directory.
 *
 * @param shouldWrite - false to only report which files need a fix
 */
function fixLottieAssets(directory: string, shouldWrite = true): FixedAsset[] {
    return Object.entries(ASSET_FIXES).map(([animationName, fixes]) => {
        const fileName = `${animationName}.lottie`;
        return {fileName, appliedFixes: fixLottieFile(path.join(directory, fileName), fixes, shouldWrite)};
    });
}

export default fixLottieAssets;
export {changeFrameRate, fixLottieFile, removeFullSizeCircleMattes, removeVisibleFlagFromMattes};
