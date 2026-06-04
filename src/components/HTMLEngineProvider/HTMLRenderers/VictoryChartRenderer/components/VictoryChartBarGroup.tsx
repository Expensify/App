import React from 'react';
import type {TNode} from 'react-native-render-html';
import {BarGroup} from 'victory-native';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {useVictoryChartRenderArgs} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseCornerRadius from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseCornerRadius';
import parseOffset from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseOffset';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

type VictoryChartBarGroupProps = {
    tnode: TNode;
    isHorizontal?: boolean;
};

function VictoryChartBarGroup({tnode, isHorizontal}: VictoryChartBarGroupProps) {
    const {points, chartBounds} = useVictoryChartRenderArgs();
    const barChildren = tnode.children.filter((child) => child.tagName === 'victorybar');
    const firstBarChild = barChildren.at(0);

    if (!firstBarChild) {
        return null;
    }

    const roundedCorners = parseCornerRadius(firstBarChild?.attributes?.cornerradius ?? '');
    const barWidth = firstBarChild.attributes.barwidth !== undefined ? Number(parseAttribute(firstBarChild.attributes.barwidth)) : undefined;
    const betweenGroupPadding = barWidth
        ? parseOffset(tnode.attributes.offset, chartBounds, barChildren.length, barWidth, points[getYKey(firstBarChild)].length, isHorizontal ?? false)
        : undefined;

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

VictoryChartBarGroup.displayName = 'VictoryChartBarGroup';

export default VictoryChartBarGroup;
