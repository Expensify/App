/**
 * Manages hover/tap interactions on Victory bar charts, providing hit-testing
 * against rendered bars, tooltip state, and click-through navigation to search.
 */
import {useChartInteractions} from '@components/Charts/hooks';
import type {HitTestArgs, ResolveTargetIndexArgs} from '@components/Charts/hooks';
import {X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {CartesianChartData, PolarChartData, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getChartPointMetadataKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartPointMetadataKey';
import {getVictoryBarInteractionGeometry, isCursorInVerticalBar} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getVictoryBarInteractionGeometry';
import type {BarSeriesLayoutConfig} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getVictoryBarInteractionGeometry';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import type {TNode} from 'react-native-render-html';
import type {CartesianChartRenderArg} from 'victory-native';

import {useState} from 'react';
import {useAnimatedReaction, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

type BarSeriesConfig = Partial<Record<YKey, BarSeriesLayoutConfig>>;

type InteractiveBar = {
    xValue: CartesianChartData[typeof X_KEY];
    yKey: YKey;
    label: string;
    searchQuery?: string;
};

function isCartesianChartData(row: CartesianChartData | PolarChartData): row is CartesianChartData {
    return X_KEY in row;
}

function collectVerticalBarSeries(children: readonly TNode[]): BarSeriesConfig {
    const config: BarSeriesConfig = {};

    const visit = (node: TNode) => {
        if (node.tagName === 'victorybar') {
            config[getYKey(node)] = {barWidth: parseAttributeAsNumber(node.attributes.barwidth)};
            return;
        }
        if (node.tagName === 'victorygroup' && !('horizontal' in node.attributes)) {
            const barChildren = node.children.filter((child) => child.tagName === 'victorybar');
            const groupYKeys = barChildren.map(getYKey);
            const firstBarChild = barChildren.at(0);
            const firstBarWidth = firstBarChild ? parseAttributeAsNumber(firstBarChild.attributes.barwidth) : undefined;

            for (let index = 0; index < barChildren.length; index++) {
                const child = barChildren.at(index);
                if (!child) {
                    continue;
                }

                config[getYKey(child)] = {
                    group: {
                        yKeys: groupYKeys,
                        index,
                        barWidth: firstBarWidth,
                        offsetAttribute: node.attributes.offset,
                    },
                };
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
            });
        }
    }

    return interactiveBars;
}

function useVictoryBarInteractions() {
    const {tnode, data, yKeys, pointMetadata, isHorizontal} = useVictoryChartContext();
    const rows = Object.values(data).filter(isCartesianChartData);
    const barSeriesConfig = isHorizontal ? {} : collectVerticalBarSeries(tnode.children);
    const interactiveBars = buildInteractiveBars(rows, yKeys, barSeriesConfig, pointMetadata);
    const pointWidth = useSharedValue<number[]>([]);
    const hasSearchQuery = useSharedValue<number[]>([]);
    const chartBottom = useSharedValue(0);
    const yZero = useSharedValue(0);

    const checkIsOverBar = (args: HitTestArgs) => {
        'worklet';

        const width = pointWidth.get().at(args.targetIndex) ?? 0;
        return isCursorInVerticalBar(args.cursorX, args.cursorY, args.targetX, args.targetY, width, yZero.get());
    };

    const checkIsClickableBar = (args: HitTestArgs) => {
        'worklet';

        return checkIsOverBar(args) && (hasSearchQuery.get().at(args.targetIndex) ?? 0) === 1;
    };

    const resolveBarTargetIndex = (args: ResolveTargetIndexArgs) => {
        'worklet';

        const xs = args.pointX;
        const ys = args.pointY;
        const widths = pointWidth.get();
        const zero = yZero.get();
        let bestIndex = -1;
        let bestDistance = Infinity;

        for (let i = 0; i < xs.length; i++) {
            const width = widths.at(i) ?? 0;
            if (width <= 0) {
                continue;
            }

            const targetX = xs.at(i) ?? 0;
            const targetY = ys.at(i) ?? 0;
            const isHit = isCursorInVerticalBar(args.cursorX, args.cursorY, targetX, targetY, width, zero);

            if (!isHit) {
                continue;
            }

            const distance = Math.abs(args.cursorX - targetX);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = i;
            }
        }

        return bestIndex;
    };

    const navigateToBarSearch = (index: number) => {
        const searchQuery = interactiveBars.at(index)?.searchQuery;
        if (!searchQuery) {
            return;
        }
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery}));
    };

    const {customGestures, setPointPositions, matchedIndex, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useChartInteractions({
        handlePress: navigateToBarSearch,
        checkIsOver: checkIsOverBar,
        checkIsClickable: checkIsClickableBar,
        resolveTargetIndex: resolveBarTargetIndex,
        chartBottom,
        yZero,
    });

    const [activeBarIndex, setActiveBarIndex] = useState(-1);
    useAnimatedReaction(
        () => matchedIndex.get(),
        (index) => {
            scheduleOnRN(setActiveBarIndex, index);
        },
    );

    const syncBarPositions = (renderArgs: CartesianChartRenderArg<CartesianChartData, YKey>) => {
        const {points, chartBounds, yScale} = renderArgs;
        const xs: number[] = [];
        const ys: number[] = [];
        const widths: number[] = [];
        const searchQueryFlags: number[] = [];

        for (const bar of interactiveBars) {
            const point = points[bar.yKey]?.find((candidate) => candidate.xValue === bar.xValue);
            if (!point) {
                continue;
            }

            const seriesPointCount = points[bar.yKey]?.length ?? 0;
            const geometry = getVictoryBarInteractionGeometry(point, chartBounds, seriesPointCount, barSeriesConfig[bar.yKey]);
            if (!geometry) {
                continue;
            }

            xs.push(geometry.x);
            ys.push(geometry.y);
            widths.push(geometry.width);
            searchQueryFlags.push(bar.searchQuery ? 1 : 0);
        }

        setPointPositions(xs, ys);
        pointWidth.set(widths);
        hasSearchQuery.set(searchQueryFlags);
        chartBottom.set(chartBounds.bottom);
        yZero.set(yScale(0));
    };

    return {
        customGestures,
        syncBarPositions,
        activeLabel: activeBarIndex >= 0 ? interactiveBars.at(activeBarIndex)?.label : undefined,
        hasTooltipLabels: interactiveBars.some((bar) => !!bar.label),
        isTooltipActive,
        isCursorOverClickable,
        initialTooltipPosition,
    };
}

export default useVictoryBarInteractions;
