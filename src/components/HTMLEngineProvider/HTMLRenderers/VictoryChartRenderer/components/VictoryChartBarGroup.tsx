import React from 'react';
import type {TNode} from 'react-native-render-html';
import {BarGroup} from 'victory-native';
import {BAR_INNER_PADDING} from '@components/Charts/BarChart/BarChartContent';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {useVictoryChartRenderArgs} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseCornerRadius from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseCornerRadius';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

type VictoryCharBarGroupProps = {tnode: TNode};

const BAR_BETWEEN_GROUP_PADDING = 2 / 3;
const BAR_WITHIN_GROUP_PADDING = BAR_INNER_PADDING;

function VictoryCharBarGroup({tnode}: VictoryCharBarGroupProps) {
    const {points, chartBounds} = useVictoryChartRenderArgs();
    const barChildren = tnode.children.filter((child) => child.tagName === 'victorybar');
    return (
        <BarGroup
            chartBounds={chartBounds}
            betweenGroupPadding={BAR_BETWEEN_GROUP_PADDING}
            withinGroupPadding={BAR_WITHIN_GROUP_PADDING}
            roundedCorners={parseCornerRadius(barChildren.at(0)?.attributes?.cornerradius ?? '')}
            barWidth={parseAttribute(barChildren.at(0)?.attributes?.barwidth ?? '')}
        >
            {barChildren.map((child) => {
                const yKey = getYKey(child);
                const {nodeStyles} = parseStyles(child);
                return (
                    <BarGroup.Bar
                        key={`${child.tagName ?? 'node'}-${yKey}`}
                        color={nodeStyles.fill ?? VictoryTheme.colors.default}
                        points={points[yKey]}
                    />
                );
            })}
        </BarGroup>
    );
}

VictoryCharBarGroup.displayName = 'VictoryCharBarGroup';

export default VictoryCharBarGroup;
