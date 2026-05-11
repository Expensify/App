import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {type CustomRendererProps, type TBlock, TNodeChildrenRenderer} from 'react-native-render-html';
import {Bar, CartesianChart} from 'victory-native';
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
    return (
        <View style={{height: 300}}>
            <CartesianChart
                data={[]}
                xKey="x"
                yKeys={['y']}
            >
                {({points, chartBounds}) => (
                    <Bar
                        points={points.y}
                        chartBounds={chartBounds}
                        color="red"
                        roundedCorners={{topLeft: 10, topRight: 10}}
                    />
                )}
            </CartesianChart>
        </View>
    );
}

export default VictoryChartRenderer;
