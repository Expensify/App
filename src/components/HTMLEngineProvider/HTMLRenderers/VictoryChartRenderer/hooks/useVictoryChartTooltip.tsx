import {TOOLTIP_BAR_GAP} from '@components/Charts/hooks';
import useChartInteractionState from '@components/Charts/hooks/useChartInteractionState';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import type {CartesianChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

import type {MutableRefObject} from 'react';
import type {View} from 'react-native';
import type {TNode} from 'react-native-render-html';
import type {CartesianChartRenderArg} from 'victory-native';

import {useState} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {useAnimatedReaction, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

// Matches LineChart's interactive hit radius (DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS).
const DOT_HIT_RADIUS = 8;

type RowType = 'bar' | 'line';

type HitTestArgs = {
    cursorX: number;
    cursorY: number;
    targetX: number;
    targetY: number;
    barWidth: number;
    chartBottom: number;
    chartLeft: number;
    isHorizontal: boolean;
};

type CheckIsOver = (args: HitTestArgs) => boolean;

const checkIsOverBar: CheckIsOver = (args) => {
    'worklet';

    if (args.barWidth <= 0) {
        return false;
    }
    if (args.isHorizontal) {
        const rectLeft = Math.min(args.targetX, args.chartLeft);
        const rectRight = Math.max(args.targetX, args.chartLeft);
        return args.cursorX >= rectLeft && args.cursorX <= rectRight && args.cursorY >= args.targetY - args.barWidth / 2 && args.cursorY <= args.targetY + args.barWidth / 2;
    }
    const rectLeft = args.targetX - args.barWidth / 2;
    const rectRight = args.targetX + args.barWidth / 2;
    const rectTop = Math.min(args.targetY, args.chartBottom);
    const rectBottom = args.chartBottom;
    return args.cursorX >= rectLeft && args.cursorX <= rectRight && args.cursorY >= rectTop && args.cursorY <= rectBottom;
};

const checkIsOverDot: CheckIsOver = (args) => {
    'worklet';

    const dx = args.cursorX - args.targetX;
    const dy = args.cursorY - args.targetY;
    return Math.hypot(dx, dy) <= DOT_HIT_RADIUS;
};

// Chart-type → hit-test worklet. Add a new entry here to support additional series types.
const CHECK_IS_OVER_BY_TYPE: Record<RowType, CheckIsOver> = {
    bar: checkIsOverBar,
    line: checkIsOverDot,
};

type RowMetadata = {
    yKey: YKey;
    labelIndex: number;
    type: RowType;
    barWidth: number;
    label: string | undefined;
};

function collectSeriesGeometry(children: readonly TNode[]): {barWidthByYKey: Partial<Record<YKey, number>>; isLineMode: Partial<Record<YKey, boolean>>} {
    const barWidthByYKey: Partial<Record<YKey, number>> = {};
    const isLineMode: Partial<Record<YKey, boolean>> = {};
    const visit = (node: TNode) => {
        const tag = node.tagName ?? '';
        if (tag === 'victorybar') {
            const yKey = getYKey(node);
            const width = parseAttributeAsNumber(node.attributes.barwidth);
            if (width !== undefined) {
                barWidthByYKey[yKey] = width;
            }
            return;
        }
        if (tag === 'victoryline') {
            isLineMode[getYKey(node)] = true;
            return;
        }
        if (tag === 'victorygroup') {
            for (const child of node.children) {
                visit(child);
            }
        }
    };
    for (const child of children) {
        visit(child);
    }
    return {barWidthByYKey, isLineMode};
}

/**
 * Wires the tap+hover tooltip pipeline for the HTML CartesianChart.
 * Pulls chart config from `useVictoryChartContext`, exposes gestures + tooltip state for the caller to compose,
 * and returns `handleRender` which the caller must invoke from `<CartesianChart>`'s children render-prop on
 * every render so the hit-test always reads the coord space the chart just drew with.
 *
 * All hit-testing runs on the UI thread: gesture worklets read per-row projected positions from SharedValues
 * (populated on the JS thread from `handleRender`), dispatch to the correct hit-test worklet via
 * `CHECK_IS_OVER_BY_TYPE`, and update `matchedIndex`. The only JS-thread hop is the final `matchedIndex → activeRowIndex`
 * bridge, which drives the tooltip's label lookup.
 */
function useVictoryChartTooltip(containerRef?: MutableRefObject<View | null>) {
    const {tnode, data, yKeys, labelsByYKey, isHorizontal} = useVictoryChartContext();
    const {barWidthByYKey, isLineMode} = collectSeriesGeometry(tnode.children);
    const rows = Object.values(data);
    const horizontal = isHorizontal ?? false;

    const labelCursor: Partial<Record<YKey, number>> = {};
    const rowMetadata: RowMetadata[] = rows.map((row) => {
        // Each row has exactly one populated yKey (the series it belongs to).
        const yKey = yKeys.find((k) => row[k] != null) as YKey | undefined;
        if (!yKey) {
            return {yKey: yKeys.at(0) as YKey, labelIndex: -1, type: 'bar', barWidth: 0, label: undefined};
        }
        const labelIndex = labelCursor[yKey] ?? 0;
        labelCursor[yKey] = labelIndex + 1;
        return {
            yKey,
            labelIndex,
            type: isLineMode[yKey] ? 'line' : 'bar',
            barWidth: barWidthByYKey[yKey] ?? 0,
            label: labelsByYKey[yKey]?.[labelIndex],
        };
    });
    const hasAnyLabels = rowMetadata.some((m) => !!m.label);

    // Per-row projection populated by handleRender (JS thread), read by hit-test worklets (UI thread).
    // All positions live in the chart's *layout* coord space (raw Skia coord, 0..canvasSize.width) — the
    // same coord `style.left` speaks so the tooltip lands on the bar even under an ancestor CSS transform.
    const rowPointsX = useSharedValue<number[]>([]);
    const rowPointsY = useSharedValue<number[]>([]);
    const rowTypes = useSharedValue<RowType[]>([]);
    const rowBarWidths = useSharedValue<number[]>([]);
    // Baselines populated by handleRender (also in layout coord).
    const chartBottom = useSharedValue(0);
    const chartLeft = useSharedValue(0);
    // Ratio of canvas *visual* size (getBoundingClientRect, post ancestor transform) to *layout* size
    // (canvasSize.width from VN). Used to project cursor coords (which the gesture reports in visual
    // pixels) up into layout coord where `rowPointsX` lives.
    const visualToLayoutScaleX = useSharedValue(1);
    const visualToLayoutScaleY = useSharedValue(1);
    // Shared interaction state (matchedIndex, x.position, y.y.position, cursor, isActive) — reused from @components/Charts.
    const {state} = useChartInteractionState();

    // Worklet: linear scan over rows, return the closest hit's row index or -1.
    // Grouped bars (e.g. adjacent series at the same x-cluster) can have overlapping hit-rects;
    // we tiebreak by distance to the bar's center on the primary axis so the closer bar wins.
    const findMatchedRow = (cursorX: number, cursorY: number) => {
        'worklet';

        const xs = rowPointsX.get();
        const ys = rowPointsY.get();
        const types = rowTypes.get();
        const widths = rowBarWidths.get();
        const bottom = chartBottom.get();
        const left = chartLeft.get();
        let bestIdx = -1;
        let bestDistance = Infinity;
        for (let i = 0; i < xs.length; i++) {
            const check = CHECK_IS_OVER_BY_TYPE[types[i]];
            if (!check) {
                continue;
            }
            const hit = check({
                cursorX,
                cursorY,
                targetX: xs[i],
                targetY: ys[i],
                barWidth: widths[i],
                chartBottom: bottom,
                chartLeft: left,
                isHorizontal: horizontal,
            });
            if (!hit) {
                continue;
            }
            const distance = horizontal ? Math.abs(cursorY - ys[i]) : Math.abs(cursorX - xs[i]);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIdx = i;
            }
        }
        return bestIdx;
    };

    const applyMatch = (idx: number) => {
        'worklet';

        state.matchedIndex.set(idx);
        if (idx >= 0) {
            state.x.position.set(rowPointsX.get()[idx]);
            state.y.y.position.set(rowPointsY.get()[idx]);
        }
    };

    // Gesture reports cursor in visual (post CSS transform) pixels; row positions live in layout coord.
    // Project cursor up so both operands of the hit-test share one space.
    const projectCursorToLayout = (x: number, y: number): {x: number; y: number} => {
        'worklet';

        return {x: x * visualToLayoutScaleX.get(), y: y * visualToLayoutScaleY.get()};
    };

    const hoverGesture = Gesture.Hover()
        .onBegin((e) => {
            'worklet';

            state.isActive.set(true);
            const cursor = projectCursorToLayout(e.x, e.y);
            state.cursor.x.set(cursor.x);
            state.cursor.y.set(cursor.y);
            applyMatch(findMatchedRow(cursor.x, cursor.y));
        })
        .onUpdate((e) => {
            'worklet';

            const cursor = projectCursorToLayout(e.x, e.y);
            state.cursor.x.set(cursor.x);
            state.cursor.y.set(cursor.y);
            applyMatch(findMatchedRow(cursor.x, cursor.y));
        })
        .onEnd(() => {
            'worklet';

            state.isActive.set(false);
            state.matchedIndex.set(-1);
        });

    const tapGesture = Gesture.Tap().onEnd((e) => {
        'worklet';

        const cursor = projectCursorToLayout(e.x, e.y);
        state.cursor.x.set(cursor.x);
        state.cursor.y.set(cursor.y);
        applyMatch(findMatchedRow(cursor.x, cursor.y));
    });

    const gestures = Gesture.Race(hoverGesture, tapGesture);

    const isTooltipActive = useDerivedValue(() => state.matchedIndex.get() >= 0);

    const initialTooltipPosition = useDerivedValue(() => {
        if (state.matchedIndex.get() < 0) {
            return {x: 0, y: 0};
        }
        const tx = state.x.position.get();
        const ty = state.y.y.position.get();
        if (horizontal) {
            return {x: tx, y: ty - TOOLTIP_BAR_GAP};
        }
        const barTop = Math.min(ty, chartBottom.get());
        return {x: tx, y: barTop - TOOLTIP_BAR_GAP};
    });

    // Bridge matchedIndex → RN state so the caller can look up the label to render.
    const [activeRowIndex, setActiveRowIndex] = useState(-1);
    useAnimatedReaction(
        () => state.matchedIndex.get(),
        (v) => scheduleOnRN(setActiveRowIndex, v),
    );

    // Called from CartesianChart's children render prop on every render — captures per-row Skia-drawn
    // positions in *layout* coord (0..canvasSize.width) plus the current visual/layout ratio for
    // cursor projection at hit-test time. Layout coord is what `style.left` speaks natively, so the
    // tooltip lands on the bar even when an ancestor CSS `transform: scale` shrinks the whole subtree.
    //
    // Note: `points[yKey]` is sorted by xValue, not by our data-insertion order — look up by xValue.
    const handleRender = (renderArgs: CartesianChartRenderArg<CartesianChartData, YKey>) => {
        const {points, canvasSize, chartBounds: currentChartBounds} = renderArgs;
        const container = containerRef?.current as unknown as HTMLElement | null;
        const canvas = container && typeof container.querySelector === 'function' ? container.querySelector('canvas') : null;
        const canvasRect = canvas?.getBoundingClientRect();
        const visualToLayoutX = canvasRect && canvasRect.width > 0 && canvasSize.width > 0 ? canvasSize.width / canvasRect.width : 1;
        const visualToLayoutY = canvasRect && canvasRect.height > 0 && canvasSize.height > 0 ? canvasSize.height / canvasRect.height : 1;
        visualToLayoutScaleX.set(visualToLayoutX);
        visualToLayoutScaleY.set(visualToLayoutY);

        const xs: number[] = new Array(rowMetadata.length);
        const ys: number[] = new Array(rowMetadata.length);
        const types: RowType[] = new Array(rowMetadata.length);
        const widths: number[] = new Array(rowMetadata.length);
        for (let i = 0; i < rowMetadata.length; i++) {
            const row = rows[i];
            const meta = rowMetadata[i];
            const point = points[meta.yKey]?.find((p) => p.xValue === row.x);
            xs[i] = point?.x ?? 0;
            ys[i] = typeof point?.y === 'number' ? point.y : 0;
            types[i] = meta.type;
            widths[i] = meta.barWidth;
        }
        rowPointsX.set(xs);
        rowPointsY.set(ys);
        rowTypes.set(types);
        rowBarWidths.set(widths);
        chartBottom.set(currentChartBounds.bottom);
        chartLeft.set(currentChartBounds.left);
    };

    const activeLabel = activeRowIndex >= 0 ? rowMetadata[activeRowIndex]?.label : undefined;

    return {
        gestures,
        handleRender,
        hasAnyLabels,
        activeLabel,
        isTooltipActive,
        initialTooltipPosition,
    };
}

export default useVictoryChartTooltip;
