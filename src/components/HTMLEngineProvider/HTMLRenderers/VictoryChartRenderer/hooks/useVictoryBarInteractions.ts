/**
 * Manages hover/tap interactions on Victory bar charts, providing hit-testing
 * against rendered bars, tooltip state, and click-through navigation to search.
 */
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import {TOOLTIP_BAR_GAP} from '@components/Charts/hooks';
import useChartInteractionState from '@components/Charts/hooks/useChartInteractionState';
import {X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {CartesianChartData, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getChartPointMetadataKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartPointMetadataKey';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import type {SearchQueryString} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import type {TNode} from 'react-native-render-html';
import type {CartesianChartRenderArg} from 'victory-native';

import {useState} from 'react';
import {Platform} from 'react-native';
import {Gesture} from 'react-native-gesture-handler';
import {useAnimatedReaction, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

const SHOULD_SHOW_TOOLTIPS = Platform.OS === 'web';

type BarSeriesConfig = Partial<Record<YKey, {barWidth?: number}>>;

type InteractiveBar = {
    xValue: CartesianChartData[typeof X_KEY];
    yKey: YKey;
    label: string;
    searchQuery?: string;
    barWidth?: number;
};

function collectVerticalBarSeries(children: readonly TNode[]): BarSeriesConfig {
    const config: BarSeriesConfig = {};

    const visit = (node: TNode) => {
        if (node.tagName === 'victorybar') {
            config[getYKey(node)] = {barWidth: parseAttributeAsNumber(node.attributes.barwidth)};
            return;
        }
        if (node.tagName === 'victorygroup' && !('horizontal' in node.attributes)) {
            for (const child of node.children) {
                visit(child);
            }
        }
    };

    for (const child of children) {
        visit(child);
    }

    return config;
}

function buildInteractiveBars(rows: CartesianChartData[], yKeys: YKey[], barSeriesConfig: BarSeriesConfig, pointMetadata: ReturnType<typeof useVictoryChartContext>['pointMetadata']) {
    const interactiveBars: InteractiveBar[] = [];

    for (const row of rows) {
        const xValue = row[X_KEY];
        for (const yKey of yKeys) {
            if (!(yKey in barSeriesConfig) || typeof row[yKey] !== 'number') {
                continue;
            }

            const metadata = pointMetadata[yKey]?.[getChartPointMetadataKey(xValue)];
            if (!metadata?.label && !metadata?.searchQuery) {
                continue;
            }

            interactiveBars.push({
                xValue,
                yKey,
                label: metadata.label ?? String(xValue),
                searchQuery: metadata.searchQuery,
                barWidth: barSeriesConfig[yKey]?.barWidth,
            });
        }
    }

    return interactiveBars;
}

function useVictoryBarInteractions() {
    const {tnode, data, yKeys, pointMetadata, isHorizontal} = useVictoryChartContext();
    const rows = Object.values(data) as CartesianChartData[];
    const barSeriesConfig = isHorizontal ? {} : collectVerticalBarSeries(tnode.children);
    const interactiveBars = buildInteractiveBars(rows, yKeys, barSeriesConfig, pointMetadata);
    const {state} = useChartInteractionState();
    const pointX = useSharedValue<number[]>([]);
    const pointY = useSharedValue<number[]>([]);
    const pointWidth = useSharedValue<number[]>([]);
    const hasSearchQuery = useSharedValue<number[]>([]);
    const chartBottom = useSharedValue(0);

    const findMatchedBar = (cursorX: number, cursorY: number) => {
        'worklet';

        const xs = pointX.get();
        const ys = pointY.get();
        const widths = pointWidth.get();
        const bottom = chartBottom.get();
        let bestIndex = -1;
        let bestDistance = Infinity;

        for (let i = 0; i < xs.length; i++) {
            const width = widths.at(i) ?? 0;
            if (width <= 0) {
                continue;
            }

            const targetX = xs.at(i) ?? 0;
            const targetY = ys.at(i) ?? 0;
            const barLeft = targetX - width / 2;
            const barRight = targetX + width / 2;
            const barTop = Math.min(targetY, bottom);
            const barBottom = Math.max(targetY, bottom);
            const isHit = cursorX >= barLeft && cursorX <= barRight && cursorY >= barTop && cursorY <= barBottom;

            if (!isHit) {
                continue;
            }

            const distance = Math.abs(cursorX - targetX);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = i;
            }
        }

        return bestIndex;
    };

    const applyMatch = (index: number) => {
        'worklet';

        state.matchedIndex.set(index);
        if (index < 0) {
            return;
        }

        state.x.position.set(pointX.get().at(index) ?? 0);
        state.x.value.set(index);
        state.y.y.position.set(pointY.get().at(index) ?? 0);
    };

    const navigateToBarSearch = (index: number) => {
        const searchQuery = interactiveBars.at(index)?.searchQuery;
        if (!searchQuery) {
            return;
        }
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery as SearchQueryString}));
    };

    const hoverGesture = Gesture.Hover()
        .onBegin((event) => {
            'worklet';

            state.isActive.set(true);
            state.cursor.x.set(event.x);
            state.cursor.y.set(event.y);
            applyMatch(findMatchedBar(event.x, event.y));
        })
        .onUpdate((event) => {
            'worklet';

            state.cursor.x.set(event.x);
            state.cursor.y.set(event.y);
            applyMatch(findMatchedBar(event.x, event.y));
        })
        .onEnd(() => {
            'worklet';

            state.isActive.set(false);
            state.matchedIndex.set(-1);
        });

    const tapGesture = Gesture.Tap().onEnd((event) => {
        'worklet';

        state.cursor.x.set(event.x);
        state.cursor.y.set(event.y);
        const index = findMatchedBar(event.x, event.y);
        applyMatch(index);
        if (index >= 0 && (hasSearchQuery.get().at(index) ?? 0) === 1) {
            scheduleOnRN(navigateToBarSearch, index);
        }
    });

    const customGestures = Gesture.Race(hoverGesture, tapGesture);

    const isTooltipActive = useDerivedValue(() => SHOULD_SHOW_TOOLTIPS && state.isActive.get() && state.matchedIndex.get() >= 0);

    const isCursorOverClickable = useDerivedValue(() => {
        const index = state.matchedIndex.get();
        return index >= 0 && (hasSearchQuery.get().at(index) ?? 0) === 1;
    });

    const initialTooltipPosition = useDerivedValue(() => {
        const index = state.matchedIndex.get();
        if (index < 0) {
            return {x: 0, y: 0};
        }

        const targetY = state.y.y.position.get();
        return {
            x: state.x.position.get(),
            y: Math.min(targetY, chartBottom.get()) - TOOLTIP_BAR_GAP,
        };
    });

    const [activeBarIndex, setActiveBarIndex] = useState(-1);
    useAnimatedReaction(
        () => state.matchedIndex.get(),
        (index) => {
            scheduleOnRN(setActiveBarIndex, index);
        },
    );

    const syncBarPositions = (renderArgs: CartesianChartRenderArg<CartesianChartData, YKey>) => {
        const {points, chartBounds} = renderArgs;
        const xs: number[] = [];
        const ys: number[] = [];
        const widths: number[] = [];
        const searchQueryFlags: number[] = [];

        for (const bar of interactiveBars) {
            const point = points[bar.yKey]?.find((candidate) => candidate.xValue === bar.xValue);
            if (!point || typeof point.y !== 'number') {
                continue;
            }

            const seriesPointCount = points[bar.yKey]?.length ?? 0;
            const fallbackBarWidth = seriesPointCount > 0 ? ((1 - BAR_INNER_PADDING) * (chartBounds.right - chartBounds.left)) / seriesPointCount : 0;
            xs.push(point.x);
            ys.push(point.y);
            widths.push(bar.barWidth ?? fallbackBarWidth);
            searchQueryFlags.push(bar.searchQuery ? 1 : 0);
        }

        pointX.set(xs);
        pointY.set(ys);
        pointWidth.set(widths);
        hasSearchQuery.set(searchQueryFlags);
        chartBottom.set(chartBounds.bottom);
    };

    return {
        customGestures,
        syncBarPositions,
        activeLabel: activeBarIndex >= 0 ? interactiveBars.at(activeBarIndex)?.label : undefined,
        hasTooltipLabels: SHOULD_SHOW_TOOLTIPS && interactiveBars.some((bar) => !!bar.label),
        isTooltipActive,
        isCursorOverClickable,
        initialTooltipPosition,
    };
}

export default useVictoryBarInteractions;
