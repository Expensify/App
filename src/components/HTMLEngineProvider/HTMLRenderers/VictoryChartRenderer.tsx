import JSON5 from 'json5';
import lodashMerge from 'lodash/merge';
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

const X_KEY = 'x';
const Y_KEY_PREFIX = 'y';

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
function extractData(tnode: TNode): Record<string, Record<string, unknown>> {
    const rawData = {};
    if (tnode.attributes?.data) {
        const parsedData = JSON5.parse(tnode.attributes.data);
        if (Array.isArray(parsedData)) {
            const xKey = X_KEY;
            const yKey = Y_KEY_PREFIX + getHierarchyID(tnode);
            parsedData.forEach((point) => {
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
 * Returns required attributes for `<CartesianChart />`
 */
function prepareDataForCartesianChart(rawData: Record<string, Record<string, unknown>>) {
    const data = Object.values(rawData);
    const xKey = X_KEY;
    const yKeys = data.length > 0 ? Object.keys(data[0]).filter((key) => key !== xKey) : [];
    return {
        data,
        xKey,
        yKeys,
    };
}

function VictoryChartRenderer({TDefaultRenderer, tnode, ...defaultRendererProps}: CustomRendererProps<TBlock>) {
    const rawData = useMemo(() => extractData(tnode), []);
    const isPolarChart = useMemo(() => false, [rawData]);
    const {data, xKey, yKeys} = useMemo(() => (isPolarChart ? {} : prepareDataForCartesianChart(rawData)), [rawData, isPolarChart]);

    window.tnode = tnode;
    console.log({data});

    const renderChild = useCallback((tnode, index, points, chartBounds) => {
        const key = `${tnode.tagName ?? 'node'}-${index}`;
        const yKey = Y_KEY_PREFIX + getHierarchyID(tnode);
        switch (tnode.tagName) {
            case 'victorybar':
                return (
                    <Bar
                        key={key}
                        points={points[yKey]}
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
                        points={points[yKey]}
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
