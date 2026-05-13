import JSON5 from 'json5';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {type CustomRendererProps, type TBlock, TNode, TNodeChildrenRenderer} from 'react-native-render-html';
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
 * Traverse node and extract and parse `data` attributes
 * The retured array is 1D - All nested data are flattened
 */
function extractData(tnode: TNode): Array<Record<string, unknown>> {
    const data: Array<Record<string, unknown>> = [];
    if (tnode.attributes?.data) {
        const parsedData = JSON5.parse(tnode.attributes.data);
        if (Array.isArray(parsedData)) {
            data.push(...parsedData);
        }
    }
    data.push(...tnode.children.flatMap((child) => extractData(child)));
    return data;
}

/**
 * Process raw data and combine points based on shared xKey
 */
function processDataForCartesianChart(rawData: Array<Record<string, unknown>>) {
    const xKey = 'x';
    const yKeys = [];
    const data = Object.values(
        rawData.reduce((points, point) => {
            const yLevel = (points[point.x]?.yLevel ?? 0) + 1;
            const yKey = 'y' + yLevel;
            yKeys.push(yKey);
            points[point.x] = {
                ...points[point.x],
                [xKey]: point.x,
                [yKey]: point.y,
                yLevel,
            };
            return points;
        }, {}),
    );
    return {
        data,
        xKey,
        yKeys,
    };
}

function VictoryChartRenderer({TDefaultRenderer, tnode, ...defaultRendererProps}: CustomRendererProps<TBlock>) {
    const rawData = useMemo(() => extractData(tnode), []);
    const isPolarChart = useMemo(() => false, [rawData]);
    const {data, xKey, yKeys} = useMemo(() => (isPolarChart ? {} : processDataForCartesianChart(rawData)), [rawData, isPolarChart]);

    window.tnode = tnode;
    console.log({data});

    const renderChild = useCallback((tnode, index, points, chartBounds) => {
        const key = `${tnode.tagName ?? 'node'}-${index}`;
        const hierarchyID = getHierarchyID(tnode);
        switch (tnode.tagName) {
            case 'victorybar':
                return (
                    <Bar
                        key={key}
                        points={points.y}
                        chartBounds={chartBounds}
                        color="red"
                        roundedCorners={{topLeft: 10, topRight: 10}}
                    >
                        {tnode.children.map((child, childIndex) => renderChild(child, childIndex, points, chartBounds))}
                    </Bar>
                );
            case 'victoryline':
                return (
                    <Line
                        key={key}
                        points={points.z}
                        strokeWidth={3}
                        color="green"
                    >
                        {tnode.children.map((child, childIndex) => renderChild(child, childIndex, points, chartBounds))}
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
            >
                {({points, chartBounds}) => tnode.children.map((child, childIndex) => renderChild(child, childIndex, points, chartBounds))}
            </CartesianChart>
        </View>
    );
}

export default VictoryChartRenderer;
