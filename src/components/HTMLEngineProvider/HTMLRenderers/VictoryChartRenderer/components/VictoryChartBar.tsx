import type {TNode} from '@native-html/render';
import React from 'react';
import {Bar} from 'victory-native';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {useVictoryChartRenderArgs} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseCornerRadius from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseCornerRadius';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

type VictoryChartBarProps = {tnode: TNode};

function VictoryChartBar({tnode}: VictoryChartBarProps) {
    const {points, chartBounds} = useVictoryChartRenderArgs();
    const yKey = getYKey(tnode);
    const {nodeStyles} = parseStyles(tnode);
    return (
        <Bar
            points={points[yKey]}
            chartBounds={chartBounds}
            color={nodeStyles.fill ?? VictoryTheme.colors.default}
            innerPadding={BAR_INNER_PADDING}
            roundedCorners={parseCornerRadius(tnode.attributes.cornerradius)}
            barWidth={parseAttributeAsNumber(tnode.attributes.barwidth)}
        />
    );
}

VictoryChartBar.displayName = 'VictoryChartBar';

export default VictoryChartBar;
