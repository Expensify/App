import {topLeft} from '@shopify/react-native-skia';
import JSON5 from 'json5';
import lodashIsObject from 'lodash/isObject';
import lodashMerge from 'lodash/merge';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ColorValue, ViewStyle} from 'react-native';
import {type CustomRendererProps, type TBlock, TNode, TNodeChildrenRenderer} from 'react-native-render-html';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, RoundedCorners} from 'victory-native';
import {Bar, CartesianChart, Line} from 'victory-native';
import {BAR_INNER_PADDING} from '@components/Charts/BarChart/BarChartContent';
import {DEFAULT_CHART_COLOR} from '@components/Charts/utils';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isArchivedNonExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';

const X_KEY = 'x';
const Y_KEY_PREFIX = 'y';

type RawData = Record<string, any>;

/**
 * Get node unique ID based on hierarchy
 */
function getHierarchyID(tnode: TNode): string {
    let id = String(tnode.nodeIndex);
    let parent = tnode.parent;
    while (parent) {
        id = `${parent.nodeIndex}-${id}`;
        parent = parent.parent;
    }
    return id;
}

/**
 * Traverse node and extract all points from `data` attributes
 */
function extractData(tnode: TNode) {
    const data: Record<string, RawData> = {};
    const xKey: string = X_KEY;
    const yKeys: string[] = [];

    if (tnode.attributes?.data) {
        const parsedData = parseAttribute(tnode.attributes.data);
        if (Array.isArray(parsedData)) {
            const yKey = Y_KEY_PREFIX + getHierarchyID(tnode);
            yKeys.push(yKey);
            (parsedData as RawData[]).forEach((point) => {
                data[point.x] = {
                    [xKey]: point.x,
                    [yKey]: point.y,
                };
            });
        }
    }

    tnode.children.forEach((child) => {
        const {data: childData, yKeys: childYkeys} = extractData(child);
        lodashMerge(data, childData);
        yKeys.push(...childYkeys);
    });

    return {
        data,
        xKey,
        yKeys,
    };
}

/**
 * Parse attribute as JSON or fallback to input as is
 * Example: "20" -> 20
 *        : "[ {x: 'Jan', y: 3} ]" -> `[{"x": "Jan", "y": 3}]` (Valid RFC 8259)
 *        : "Green" -> "Green"
 */
function parseAttribute(attribute: string): any {
    if (!attribute) {
        return undefined;
    }
    try {
        return JSON5.parse(attribute);
    } catch {
        return attribute;
    }
}

/**
 * Helper to parse VC's `cornerRadius` into VN's `roundedCorners`
 */
function parseCornerRadius(attribute: string): RoundedCorners | undefined {
    const cornerRadius = parseAttribute(attribute);
    if (typeof cornerRadius === 'number') {
        return {
            topLeft: cornerRadius,
            topRight: cornerRadius,
            bottomLeft: cornerRadius,
            bottomRight: cornerRadius,
        };
    }
    if (lodashIsObject(cornerRadius)) {
        return {
            topLeft: 'topLeft' in cornerRadius ? (cornerRadius.topLeft as number) : 'top' in cornerRadius ? (cornerRadius.top as number) : undefined,
            topRight: 'topRight' in cornerRadius ? (cornerRadius.topRight as number) : 'top' in cornerRadius ? (cornerRadius.top as number) : undefined,
            bottomLeft: 'bottomLeft' in cornerRadius ? (cornerRadius.bottomLeft as number) : 'bottom' in cornerRadius ? (cornerRadius.bottom as number) : undefined,
            bottomRight: 'bottomRight' in cornerRadius ? (cornerRadius.bottomRight as number) : 'bottom' in cornerRadius ? (cornerRadius.bottom as number) : undefined,
        };
    }
    return undefined;
}

/**
 * Helper to parse common styles
 */
function parseStyles(tnode: TNode) {
    const nodeStyles: ViewStyle = {};
    const parentNodeStyles: ViewStyle = {};

    const parsedHeight = parseAttribute(tnode.attributes.height);
    if (typeof parsedHeight === 'number') {
        nodeStyles.height = parsedHeight;
    }
    const parsedWidth = parseAttribute(tnode.attributes.width);
    if (typeof parsedWidth === 'number') {
        nodeStyles.width = parsedWidth;
    }

    const parsedStyle = parseAttribute(tnode.attributes.style);
    if (lodashIsObject(parsedStyle)) {
        if ('parent' in parsedStyle && lodashIsObject(parsedStyle.parent)) {
            Object.assign(parentNodeStyles, parsedStyle.parent);
        }
        if ('data' in parsedStyle && lodashIsObject(parsedStyle.data)) {
            Object.assign(nodeStyles, parsedStyle.data);
        }
    }

    return {nodeStyles, parentNodeStyles};
}

function VictoryChartRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    const {data, xKey, yKeys} = useMemo(() => extractData(tnode), [tnode]);
    const {nodeStyles, parentNodeStyles} = useMemo(() => parseStyles(tnode), [tnode]);

    const renderCartesianChartChild = useCallback((tnode: TNode, index: Number, renderArgs: CartesianChartRenderArg<RawData, string>) => {
        const key = `${tnode.tagName ?? 'node'}-${index}`;
        const yKey = Y_KEY_PREFIX + getHierarchyID(tnode);
        const {points, chartBounds} = renderArgs;
        const {nodeStyles} = parseStyles(tnode);
        switch (tnode.tagName) {
            case 'victorybar':
                return (
                    <Bar
                        key={key}
                        points={points[yKey]}
                        chartBounds={chartBounds}
                        color={nodeStyles.fill ?? DEFAULT_CHART_COLOR}
                        innerPadding={BAR_INNER_PADDING}
                        roundedCorners={parseCornerRadius(tnode.attributes.cornerradius)}
                        barWidth={parseAttribute(tnode.attributes.barwidth)}
                        labels={parseAttribute(tnode.attributes.labels)}
                    >
                        {tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
                    </Bar>
                );
            case 'victoryline':
                return (
                    <Line
                        key={key}
                        points={points[yKey]}
                        color={nodeStyles.fill ?? DEFAULT_CHART_COLOR}
                        strokeWidth={2}
                        curveType="linear"
                    >
                        {tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
                    </Line>
                );
            default:
                return null;
        }
    }, []);

    return (
        <View style={[styles.chartContainer, styles.mw100, parentNodeStyles]}>
            <View style={[styles.chartContent, styles.mw100, nodeStyles]}>
                <CartesianChart
                    data={Object.values(data)}
                    xKey={xKey}
                    yKeys={yKeys}
                    domain={parseAttribute(tnode.attributes.domain)}
                    domainPadding={parseAttribute(tnode.attributes.domainpadding)}
                    padding={parseAttribute(tnode.attributes.padding)}
                >
                    {(renderArgs) => tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
                </CartesianChart>
            </View>
        </View>
    );
}

export default VictoryChartRenderer;
