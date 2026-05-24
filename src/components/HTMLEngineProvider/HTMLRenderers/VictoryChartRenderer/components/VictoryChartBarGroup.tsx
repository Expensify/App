import React from 'react';
import type {TNode} from 'react-native-render-html';
import {Bar, BarGroup} from 'victory-native';
import {BAR_INNER_PADDING} from '@components/Charts/BarChart/BarChartContent';
import {DEFAULT_CHART_COLOR} from '@components/Charts/utils';
import {useVictoryChartRenderArgs} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseCornerRadius from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseCornerRadius';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

type VictoryCharBarGroupProps = {tnode: TNode};

function VictoryCharBarGroup({tnode}: VictoryCharBarGroupProps) {
    const {points, chartBounds} = useVictoryChartRenderArgs();
    const barChildren = tnode.children.filter((child) => child.tagName === 'victorybar');
    return (
        <BarGroup
            chartBounds={chartBounds}
            roundedCorners={parseCornerRadius(barChildren[0]?.attributes?.cornerradius)}
            barWidth={parseAttribute(barChildren[0]?.attributes?.barwidth)}
        >
            {barChildren.map((child) => {
                const yKey = getYKey(child);
                const {nodeStyles} = parseStyles(child);
                return (
                    <BarGroup.Bar
                        key={`${child.tagName ?? 'node'}-${yKey}`}
                        color={nodeStyles.fill ?? DEFAULT_CHART_COLOR}
                        points={points[yKey]}
                    />
                );
            })}
        </BarGroup>
    );
}

VictoryCharBarGroup.displayName = 'VictoryCharBarGroup';

export default VictoryCharBarGroup;
