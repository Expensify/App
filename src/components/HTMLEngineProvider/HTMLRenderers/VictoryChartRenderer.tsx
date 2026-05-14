import JSON5 from 'json5';
import lodashMerge from 'lodash/merge';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {type CustomRendererProps, type TBlock, TNode, TNodeChildrenRenderer} from 'react-native-render-html';
import type {CartesianChartRenderArg, ChartBounds, PointsArray} from 'victory-native';
import {Bar, CartesianChart, Line} from 'victory-native';
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
function extractData(tnode: TNode): Record<string, RawData> {
    const rawData: Record<string, RawData> = {};
    if (tnode.attributes?.data) {
        const parsedData = parseAttribute(tnode.attributes.data);
        if (Array.isArray(parsedData)) {
            const xKey = X_KEY;
            const yKey = Y_KEY_PREFIX + getHierarchyID(tnode);
            (parsedData as RawData[]).forEach((point) => {
                rawData[point.x] = {
                    [xKey]: point.x,
                    [yKey]: point.y,
                };
            });
        }
    }
    return lodashMerge(rawData, ...tnode.children.map((child) => extractData(child)));
}

/**
 * Returns required props for `<CartesianChart />`
 */
function prepareDataForCartesianChart(rawData: Record<string, RawData>) {
    const data = Object.values(rawData);
    const xKey = X_KEY;
    const yKeys = data.length > 0 ? Object.keys(data[0]).filter((key) => key !== xKey) : [];
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

function VictoryChartRenderer({tnode}: CustomRendererProps<TBlock>) {
    const rawData = useMemo(() => extractData(tnode), [tnode]);
    const isPolarChart = useMemo(() => false, [rawData]);
    const {data, xKey, yKeys} = useMemo(() => prepareDataForCartesianChart(rawData), [rawData, isPolarChart]);

    const renderCartesianChartChild = useCallback((tnode: TNode, index: Number, renderArgs: CartesianChartRenderArg<any, any>) => {
        const key = `${tnode.tagName ?? 'node'}-${index}`;
        const yKey = Y_KEY_PREFIX + getHierarchyID(tnode);
        const {points, chartBounds} = renderArgs;
        switch (tnode.tagName) {
            case 'victorybar':
                return (
                    <Bar
                        key={key}
                        points={points[yKey]}
                        chartBounds={chartBounds}
                    >
                        {tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
                    </Bar>
                );
            case 'victoryline':
                return (
                    <Line
                        key={key}
                        points={points[yKey]}
                    >
                        {tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
                    </Line>
                );
            default:
                return null;
        }
    }, []);

    return (
        <View style={{height: 200, width: 200}}>
            <CartesianChart
                data={data}
                xKey={xKey}
                yKeys={yKeys}
                domain={parseAttribute(tnode.attributes.domain)}
                domainPadding={parseAttribute(tnode.attributes.domainPadding)}
            >
                {(renderArgs) => tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
            </CartesianChart>
        </View>
    );
}

export default VictoryChartRenderer;
