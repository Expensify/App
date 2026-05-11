import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {type CustomRendererProps, type TBlock, TNodeChildrenRenderer} from 'react-native-render-html';
import {Bar, CartesianChart} from 'victory-native';
import type {ChartBounds, PointsArray} from 'victory-native';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isArchivedNonExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type VictoryBarRendererProps = CustomRendererProps<TBlock> & {
    points: PointsArray;
    chartBounds: ChartBounds;
};

function VictoryBarRenderer({TDefaultRenderer, points, chartBounds, ...defaultRendererProps}: VictoryBarRendererProps) {
    return <Text>Why</Text>;
}

export default VictoryBarRenderer;
