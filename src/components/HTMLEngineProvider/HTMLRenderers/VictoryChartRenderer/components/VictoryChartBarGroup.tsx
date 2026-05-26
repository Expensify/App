import React from 'react';
import type {TNode} from 'react-native-render-html';
import {BarGroup} from 'victory-native';
import {BAR_INNER_PADDING} from '@components/Charts/BarChart/BarChartContent';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {useVictoryChartRenderArgs} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseCornerRadius from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseCornerRadius';
import parseOffset from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseOffset';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

type VictoryCharBarGroupProps = {
    tnode: TNode;
    isHorizontal?: boolean;
};

function VictoryCharBarGroup({tnode, isHorizontal}: VictoryCharBarGroupProps) {
    const {points, chartBounds} = useVictoryChartRenderArgs();
    const barChildren = tnode.children.filter((child) => child.tagName === 'victorybar');
    const firstBarChild = barChildren.at(0);

    if (!firstBarChild) {
        return null;
    }

    const roundedCorners = parseCornerRadius(firstBarChild?.attributes?.cornerradius ?? '');
    const barWidth = Number(parseAttribute(firstBarChild.attributes?.barwidth ?? ''));
    const betweenGroupPadding = parseOffset(tnode.attributes.offset, chartBounds, barChildren.length, barWidth, points[getYKey(firstBarChild)].length, isHorizontal ?? false);

    return (
        <BarGroup
            chartBounds={chartBounds}
            betweenGroupPadding={betweenGroupPadding}
            withinGroupPadding={BAR_INNER_PADDING}
            roundedCorners={roundedCorners}
            barWidth={barWidth}
            isHorizontal={isHorizontal}
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
