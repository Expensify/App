import React, {useState} from 'react';
import type {MutableRefObject} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import type {CartesianChartRenderArg} from 'victory-native';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import {TOOLTIP_BAR_GAP} from '@components/Charts/hooks';
import type {CartesianChartData, ProcessNodeResult, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import useThemeStyles from '@hooks/useThemeStyles';

type RenderArgs = CartesianChartRenderArg<CartesianChartData, YKey>;

type ActiveBar = {yKey: YKey; index: number};

// Matches LineChart's interactive hit radius (DOT_RADIUS + DOT_HOVER_EXTRA_RADIUS).
const DOT_HIT_RADIUS = 8;

type VictoryChartTooltipOverlayProps = {
    renderArgsRef: MutableRefObject<RenderArgs | null>;
    yKeys: YKey[];
    isHorizontal: boolean | undefined;
    barWidthByYKey: Partial<Record<YKey, number>>;
    isLineMode: Partial<Record<YKey, boolean>>;
    labelsByYKey: ProcessNodeResult['labelsByYKey'];
    chartWidth: number;
    children: React.ReactNode;
};

function computeAverageGap(series: RenderArgs['points'][YKey]): number {
    const xs: number[] = [];
    for (const pt of series) {
        if (typeof pt.x === 'number') {
            xs.push(pt.x);
        }
    }
    if (xs.length < 2) {
        return 0;
    }
    xs.sort((a, b) => a - b);
    let total = 0;
    let count = 0;
    for (let i = 1; i < xs.length; i++) {
        const gap = xs[i] - xs[i - 1];
        if (gap > 0) {
            total += gap;
            count++;
        }
    }
    return count > 0 ? total / count : 0;
}

/**
 * Wraps a CartesianChart with a gesture-driven tooltip overlay.
 * Hit-tests touch coordinates against per-yKey bar/dot geometry derived from victory-native's
 * render-args, then surfaces the matching `labels[i]` entry through the shared `<ChartTooltip>`.
 */
function VictoryChartTooltipOverlay({renderArgsRef, yKeys, isHorizontal, barWidthByYKey, isLineMode, labelsByYKey, chartWidth, children}: VictoryChartTooltipOverlayProps) {
    const styles = useThemeStyles();
    const [activeBar, setActiveBar] = useState<ActiveBar | null>(null);
    const [isHoveringOverBar, setIsHoveringOverBar] = useState(false);
    const tooltipPosition = useSharedValue<{x: number; y: number}>({x: 0, y: 0});
    const isHovering = useSharedValue(false);

    const hasAnyLabels = yKeys.some((yKey) => (labelsByYKey[yKey]?.length ?? 0) > 0);

    const updateActiveBar = (x: number, y: number) => {
        const renderArgs = renderArgsRef.current;
        if (!renderArgs) {
            return;
        }
        const {points, chartBounds} = renderArgs;

        for (const yKey of yKeys) {
            const series = points[yKey];
            if (!series) {
                continue;
            }
            const labels = labelsByYKey[yKey];

            if (isLineMode[yKey]) {
                for (let i = 0; i < series.length; i++) {
                    const pt = series[i];
                    if (pt.x == null || pt.y == null) {
                        continue;
                    }
                    const dx = x - pt.x;
                    const dy = y - pt.y;
                    if (Math.hypot(dx, dy) <= DOT_HIT_RADIUS) {
                        if (!labels?.[i]) {
                            continue;
                        }
                        tooltipPosition.set({x: pt.x, y: pt.y - TOOLTIP_BAR_GAP});
                        setActiveBar({yKey, index: i});
                        setIsHoveringOverBar(true);
                        return;
                    }
                }
                continue;
            }

            const explicitWidth = barWidthByYKey[yKey];
            const barWidth = explicitWidth ?? computeAverageGap(series) * (1 - BAR_INNER_PADDING);
            if (!barWidth) {
                continue;
            }

            for (let i = 0; i < series.length; i++) {
                const pt = series[i];
                if (pt.x == null || pt.y == null) {
                    continue;
                }

                let rectLeft: number;
                let rectRight: number;
                let rectTop: number;
                let rectBottom: number;
                let anchorX: number;
                let anchorY: number;

                if (isHorizontal) {
                    // The x-axis holds y-values in horizontal mode; the baseline is the chart's left edge.
                    const yZeroX = chartBounds.left;
                    rectLeft = Math.min(pt.x, yZeroX);
                    rectRight = Math.max(pt.x, yZeroX);
                    rectTop = pt.y - barWidth / 2;
                    rectBottom = pt.y + barWidth / 2;
                    anchorX = pt.x;
                    anchorY = pt.y - TOOLTIP_BAR_GAP;
                } else {
                    rectLeft = pt.x - barWidth / 2;
                    rectRight = pt.x + barWidth / 2;
                    rectTop = Math.min(pt.y, chartBounds.bottom);
                    rectBottom = chartBounds.bottom;
                    anchorX = pt.x;
                    anchorY = Math.min(pt.y, chartBounds.bottom) - TOOLTIP_BAR_GAP;
                }

                if (x >= rectLeft && x <= rectRight && y >= rectTop && y <= rectBottom) {
                    if (!labels?.[i]) {
                        continue;
                    }
                    tooltipPosition.set({x: anchorX, y: anchorY});
                    setActiveBar({yKey, index: i});
                    setIsHoveringOverBar(true);
                    return;
                }
            }
        }

        setActiveBar(null);
        setIsHoveringOverBar(false);
    };

    const clearActive = () => {
        setActiveBar(null);
        setIsHoveringOverBar(false);
    };

    const hoverGesture = Gesture.Hover()
        .onBegin((e) => {
            'worklet';

            isHovering.set(true);
            tooltipPosition.set({x: e.x, y: e.y - TOOLTIP_BAR_GAP});
            scheduleOnRN(updateActiveBar, e.x, e.y);
        })
        .onUpdate((e) => {
            'worklet';

            tooltipPosition.set({x: e.x, y: e.y - TOOLTIP_BAR_GAP});
            scheduleOnRN(updateActiveBar, e.x, e.y);
        })
        .onEnd(() => {
            'worklet';

            isHovering.set(false);
            scheduleOnRN(clearActive);
        });

    const tapGesture = Gesture.Tap().onEnd((e) => {
        'worklet';

        scheduleOnRN(updateActiveBar, e.x, e.y);
    });

    const combinedGesture = Gesture.Race(hoverGesture, tapGesture);

    // No labels anywhere → skip the gesture wrapper entirely so the chart behaves identically to before.
    if (!hasAnyLabels) {
        return <>{children}</>;
    }

    const activeLabel = activeBar ? labelsByYKey[activeBar.yKey]?.[activeBar.index] : undefined;

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[styles.w100, styles.h100, isHoveringOverBar && styles.cursorPointer]}>
                {children}
                {isHoveringOverBar && !!activeLabel && (
                    <ChartTooltip
                        label={activeLabel}
                        amount=""
                        chartWidth={chartWidth}
                        initialTooltipPosition={tooltipPosition}
                    />
                )}
            </Animated.View>
        </GestureDetector>
    );
}

VictoryChartTooltipOverlay.displayName = 'VictoryChartTooltipOverlay';

export default VictoryChartTooltipOverlay;
