/**
 * Resolves pie-chart slice labels into a non-overlapping two-column layout, stacking labels to the
 * left/right of the ring based on each slice's mid-angle and pushing/compacting them to avoid collisions.
 */
import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';
import getChartSkiaTypeface from '@components/Charts/utils/getChartSkiaTypeface';
import type {LabelItem, TextAnchor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import {Skia} from '@shopify/react-native-skia';

import convertDegreeToRadian from './convertDegreeToRadian';
import getSkiaLineMetrics from './getSkiaLineMetrics';

type PieLabelSide = 'left' | 'right';

const PIE_LABEL_SIDES: PieLabelSide[] = ['left', 'right'];

type PieSliceValue = {
    label: string;
    value: number;
};

type PieSliceAngle = {
    label: string;
    /** Radians, in the same `startAngle`-relative convention as victory-native's `slice.startAngle`/`slice.endAngle`. */
    midAngle: number;
};

type PlotBounds = {
    /** Most-negative Y offset from the slice center a label may occupy. */
    top: number;
    /** Most-positive Y offset from the slice center a label may occupy. */
    bottom: number;
};

type ResolvedPieLabelLayout = {
    relativeX: number;
    relativeY: number;
    textAnchor: TextAnchor;
    /** The angle actually used for this slice's layout — may differ from `(startAngle + endAngle) / 2` for a single 100%-value slice (see `computeSliceAngles`). The indicator line must anchor to this same angle, not recompute its own from `slice.startAngle`/`slice.endAngle`, or the two would disagree. */
    midAngle: number;
};

/**
 * Replicates victory-native's own slice-angle accumulator (`Pie.Chart` computes this internally,
 * exposing only one slice at a time via its render-prop) so every slice's angle is known up front —
 * required to resolve label collisions across the whole set before any slice renders.
 */
function computeSliceAngles(values: PieSliceValue[], startAngle: number): PieSliceAngle[] {
    const onlyValue = values.length === 1 ? values.at(0) : undefined;
    if (onlyValue) {
        // A single slice fills the whole ring, so its start and end angle are the same point — the
        // "midpoint" of that 360° sweep is diametrically opposite wherever the ring's seam happens to
        // sit (the bottom, given this codebase's start angle), not a place a reader would expect a
        // label. Anchor it to a fixed, always-safe spot instead: 3 o'clock, vertically centered.
        return [{label: onlyValue.label, midAngle: 0}];
    }

    const totalValue = values.reduce((sum, entry) => sum + entry.value, 0);
    let cursorDegrees = startAngle;

    return values.map((entry) => {
        const sweepDegrees = totalValue ? (entry.value / totalValue) * 360 : 0;
        const midAngleDegrees = cursorDegrees + sweepDegrees / 2;
        cursorDegrees += sweepDegrees;
        return {label: entry.label, midAngle: convertDegreeToRadian(midAngleDegrees)};
    });
}

/** Right half of the ring (top→right→bottom) vs. left half (bottom→left→top). */
function assignColumnSide(midAngle: number): PieLabelSide {
    return Math.cos(midAngle) >= 0 ? 'right' : 'left';
}

/**
 * Sums each label line's height using the same per-line fallback `VictoryChartLabel` applies:
 * an authored `lineheight` multiplier on that line's own font size, or the font's own metrics
 * when no `lineheight` was authored for that line.
 *
 * `baseLabelItem` is the shared `labelcomponent` template (its own `text` is always empty — the
 * real per-slice text is substituted later), so the number of lines it defines is read from its
 * per-line style maps (one entry per line, e.g. bold name + gray amount) rather than from `.text`.
 */
function computeLabelBlockHeight(baseLabelItem: Pick<LabelItem, 'fontSize' | 'fontFamily' | 'fontStyle' | 'fontWeight' | 'lineHeight'>, typefaces: ChartDefaultTypeface): number {
    const lineCount = Object.keys(baseLabelItem.fontSize ?? {}).length || 1;
    let totalHeight = 0;

    for (let index = 0; index < lineCount; index++) {
        const fontSize = baseLabelItem.fontSize?.[index];
        const lineHeightMultiplier = baseLabelItem.lineHeight?.[index];
        const typeface = getChartSkiaTypeface(typefaces, {
            fontFamily: baseLabelItem.fontFamily?.[index],
            fontStyle: baseLabelItem.fontStyle?.[index],
            fontWeight: baseLabelItem.fontWeight?.[index],
        });
        const font = typeface && fontSize ? Skia.Font(typeface, fontSize) : null;
        const customLineHeight = lineHeightMultiplier && fontSize ? lineHeightMultiplier * fontSize : 0;
        totalHeight += customLineHeight || getSkiaLineMetrics(font).lineHeight;
    }

    return totalHeight;
}

/**
 * Per-column collision resolution: sort by natural Y, greedily push overlapping labels down, then
 * compact back up if the bottom-most label would exceed `plotBounds.bottom` (a forward-only pass can
 * only push down, so a cluster naturally near the bottom of a column would otherwise overflow past
 * it). As a last resort — more labels than the column can fit even at minimum spacing, not reachable
 * at realistic slice counts/font sizes — evenly redistribute across the full bounds instead, trading
 * tighter-than-`rowHeight` spacing for a guarantee of never clipping.
 */
function resolveColumnRows(naturalYs: number[], rowHeight: number, plotBounds: PlotBounds): number[] {
    const forwardPass: number[] = [];

    for (const [index, naturalY] of naturalYs.entries()) {
        const previousY = forwardPass.at(index - 1);
        const minY = previousY === undefined ? plotBounds.top : previousY + rowHeight;
        forwardPass.push(Math.max(naturalY, minY));
    }

    const overflow = Math.max(0, (forwardPass.at(-1) ?? plotBounds.top) - plotBounds.bottom);
    const compacted = forwardPass.map((y) => y - overflow);

    if ((compacted.at(0) ?? plotBounds.top) < plotBounds.top) {
        const step = naturalYs.length > 1 ? (plotBounds.bottom - plotBounds.top) / (naturalYs.length - 1) : 0;
        return compacted.map((_, index) => plotBounds.top + step * index);
    }

    return compacted;
}

/**
 * Resolves each label's final position in a two-column layout: labels sit at a fixed X to the left
 * or right of the ring (based on which side their slice's mid-angle falls on), stacked top-to-bottom
 * with enough vertical spacing (per `resolveColumnRows`) to never overlap.
 */
function computePieLabelLayout({
    slices,
    rowHeight,
    labelRadius,
    plotBounds,
}: {
    slices: PieSliceAngle[];
    rowHeight: number;
    labelRadius: number;
    plotBounds: Record<PieLabelSide, PlotBounds>;
}): Record<string, ResolvedPieLabelLayout> {
    const bySide: Record<PieLabelSide, Array<{label: string; naturalY: number; midAngle: number}>> = {left: [], right: []};

    for (const slice of slices) {
        bySide[assignColumnSide(slice.midAngle)].push({label: slice.label, naturalY: labelRadius * Math.sin(slice.midAngle), midAngle: slice.midAngle});
    }

    const resolved: Record<string, ResolvedPieLabelLayout> = {};

    for (const side of PIE_LABEL_SIDES) {
        const columnItems = [...bySide[side]].sort((a, b) => a.naturalY - b.naturalY);
        const resolvedYs = resolveColumnRows(
            columnItems.map((item) => item.naturalY),
            rowHeight,
            plotBounds[side],
        );
        const relativeX = side === 'right' ? labelRadius : -labelRadius;
        const textAnchor: TextAnchor = side === 'right' ? 'start' : 'end';

        for (const [index, item] of columnItems.entries()) {
            resolved[item.label] = {relativeX, relativeY: resolvedYs.at(index) ?? item.naturalY, textAnchor, midAngle: item.midAngle};
        }
    }

    return resolved;
}

export {computeSliceAngles, assignColumnSide, computeLabelBlockHeight};
export type {PieSliceAngle, PieSliceValue, PlotBounds};
export default computePieLabelLayout;
