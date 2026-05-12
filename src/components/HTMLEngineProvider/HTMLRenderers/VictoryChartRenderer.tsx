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

function VictoryChartRenderer({TDefaultRenderer, tnode, ...defaultRendererProps}: CustomRendererProps<TBlock>) {
    const DATA = Array.from({length: 31}, (_, i) => ({
        x: i,
        y: 40 + 30 * Math.random(),
        z: 50,
    }));

    console.log('parsed data', JSON5.parse("[ {x: 'Jan', y: 3}, {x: 'Feb', y: 5}, {x: 'Mar', y: 2}, {x: 'Apr', y: 7} ]"));

    window.tnode = tnode;

    const data = useMemo(() => {
        let currentNode: TNode | null = tnode;
        while (currentNode) {
            console.log(currentNode);
            currentNode = null;
        }
    }, []);

    const renderChild = useCallback((tnode, index, points, chartBounds) => {
        const key = `${tnode.tagName ?? 'node'}-${index}`;
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
                data={DATA}
                xKey="x"
                yKeys={['y', 'z']}
            >
                {({points, chartBounds}) => tnode.children.map((child, childIndex) => renderChild(child, childIndex, points, chartBounds))}
            </CartesianChart>
        </View>
    );
}

export default VictoryChartRenderer;
