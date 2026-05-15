import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import type {SharedValue} from 'react-native-reanimated';
import {useSharedValue} from 'react-native-reanimated';
import type {Scale} from 'victory-native';
import {AXIS_LABEL_GAP, DIAGONAL_ANGLE_RADIAN_THRESHOLD} from '@components/Charts/constants';
import type {LabelRotation} from '@components/Charts/types';
import {getAdditionalOffset, getFontLineMetrics, isCursorOverChartLabel, rotatedLabelYOffset} from '@components/Charts/utils';
import variables from '@styles/variables';
import type {HitTestArgs} from './useChartInteractions';

type LabelHitGeometry = {
    /** Constant vertical offset from chartBottom to the label Y baseline */
    labelYOffset: number;

    /** iconSize * sin(angle) — diagonal step from upper to lower corner */
    iconSin: number;

    /** Per-label: labelWidth * sin(angle) — left-corner offset for the 45° parallelogram */
    labelSins: number[];

    /** Per-label: labelWidth / 2 — half-extent for 0° and 90° hit bounds */
    halfWidths: number[];

    /** rightUpperCorner.x = targetX + cornerAnchorDX */
    cornerAnchorDX: number;

    /** rightUpperCorner.y = labelY + cornerAnchorDY */
    cornerAnchorDY: number;

    /** yMin90 = labelY + yMin90Offset */
    yMin90Offset: number;

    /** Per-label: yMax90 = labelY + yMax90Offsets[i] */
    yMax90Offsets: number[];
};

type UseLabelHitTestingParams = {
    fontMgr: SkTypefaceFontProvider | null | undefined;
    fontSize: number;
    /** Pre-computed pixel widths of each truncated label, from useChartLabelLayout. */
    truncatedLabelWidths: number[];
    labelRotation: LabelRotation;
    labelSkipInterval: number;
    chartBottom: SharedValue<number>;
};

/**
 * Shared hook for x-axis label hit-testing in cartesian charts.
 *
 * Encapsulates angle conversion, pre-computed hit geometry, and the
 * isCursorOverLabel / findLabelCursorX worklets — all of which are identical
 * between bar and line charts.
 *
 * Label widths are accepted as a pre-computed array (from useChartLabelLayout)
 * so no Skia measurement happens here.
 *
 * Labels are right-aligned at the tick: the 45° parallelogram's upper-right corner is
 * offset by (iconSize/3 * sinA) left and down, placing the box just below the axis line.
 */
function useLabelHitTesting({fontMgr, fontSize, truncatedLabelWidths, labelRotation, labelSkipInterval, chartBottom}: UseLabelHitTestingParams) {
    const tickXPositions = useSharedValue<number[]>([]);

    const angleRad = (Math.abs(labelRotation) * Math.PI) / 180;

    const fontMetrics = fontMgr ? getFontLineMetrics(fontMgr, fontSize) : null;

    let labelHitGeometry: LabelHitGeometry | null = null;
    if (fontMetrics) {
        const {ascent, descent} = fontMetrics;
        const sinA = Math.sin(angleRad);
        const padding = variables.iconSizeExtraSmall / 2;
        const iconThirdSin = (variables.iconSizeExtraSmall / 3) * sinA;
        const additionalOffset = getAdditionalOffset(angleRad);
        labelHitGeometry = {
            labelYOffset: AXIS_LABEL_GAP + rotatedLabelYOffset(ascent, descent, angleRad) - additionalOffset,
            iconSin: variables.iconSizeExtraSmall * sinA,
            labelSins: truncatedLabelWidths.map((w) => w * sinA),
            halfWidths: truncatedLabelWidths.map((w) => w / 2),
            cornerAnchorDX: -iconThirdSin,
            cornerAnchorDY: iconThirdSin,
            yMin90Offset: padding,
            yMax90Offsets: truncatedLabelWidths.map((w) => w + padding),
        };
    }

    /**
     * Hit-tests whether the cursor is over the x-axis label at `activeIndex`.
     * Supports 0°, ~45° (parallelogram), and 90° label orientations.
     */
    const isCursorOverLabel = (args: HitTestArgs, activeIndex: number): boolean => {
        'worklet';

        if (!labelHitGeometry || activeIndex % labelSkipInterval !== 0) {
            return false;
        }

        const {labelYOffset, iconSin, labelSins, halfWidths, cornerAnchorDX, cornerAnchorDY, yMin90Offset, yMax90Offsets} = labelHitGeometry;
        const padding = variables.iconSizeExtraSmall / 2;
        const halfWidth = halfWidths.at(activeIndex) ?? 0;
        const labelY = args.chartBottom + labelYOffset;

        let corners45: Array<{x: number; y: number}> | undefined;
        if (angleRad > 0 && angleRad < DIAGONAL_ANGLE_RADIAN_THRESHOLD) {
            const labelSin = labelSins.at(activeIndex) ?? 0;
            const rightUpperCorner = {x: args.targetX + cornerAnchorDX, y: labelY + cornerAnchorDY};
            const rightLowerCorner = {x: rightUpperCorner.x + iconSin, y: rightUpperCorner.y + iconSin};
            const leftUpperCorner = {x: rightUpperCorner.x - labelSin, y: rightUpperCorner.y + labelSin};
            const leftLowerCorner = {x: rightLowerCorner.x - labelSin, y: rightLowerCorner.y + labelSin};
            corners45 = [rightUpperCorner, rightLowerCorner, leftLowerCorner, leftUpperCorner];
        }

        return isCursorOverChartLabel({
            cursorX: args.cursorX,
            cursorY: args.cursorY,
            targetX: args.targetX,
            labelY,
            angleRad,
            halfWidth,
            padding,
            corners45,
            yMin90: labelY + yMin90Offset,
            yMax90: labelY + (yMax90Offsets.at(activeIndex) ?? 0),
        });
    };

    /**
     * Scans every visible label's bounding box using its own tick X as the anchor.
     * Returns that tick's X position when the cursor is inside, otherwise returns
     * the raw cursor X unchanged.
     * Used to correct Victory's nearest-point-by-X algorithm for rotated labels whose
     * bounding boxes can extend past the midpoint to the adjacent tick.
     */
    const findLabelCursorX = (cursorX: number, cursorY: number): number => {
        'worklet';

        const positions = tickXPositions.get();
        const currentChartBottom = chartBottom.get();
        for (let i = 0; i < positions.length; i++) {
            if (i % labelSkipInterval !== 0) {
                continue;
            }
            const tickX = positions.at(i);
            if (tickX === undefined) {
                continue;
            }
            if (isCursorOverLabel({cursorX, cursorY, targetX: tickX, targetY: 0, chartBottom: currentChartBottom}, i)) {
                return tickX;
            }
        }
        return cursorX;
    };

    /** Updates the tick X positions from the chart's x scale. Call from `onScaleChange`. */
    const updateTickPositions = (xScale: Scale, dataLength: number) => {
        tickXPositions.set(Array.from({length: dataLength}, (_, i) => xScale(i)));
    };

    return {isCursorOverLabel, findLabelCursorX, updateTickPositions};
}

export default useLabelHitTesting;
