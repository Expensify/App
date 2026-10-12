import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {useVictoryChartRenderArgs} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseCornerRadius from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseCornerRadius';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';
import scalePixels from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/scalePixels';

import type {TNode} from 'react-native-render-html';

import React from 'react';
import {Bar} from 'victory-native';

type VictoryChartBarProps = {tnode: TNode};

function VictoryChartBar({tnode}: VictoryChartBarProps) {
    const {points, chartBounds, pixelScale} = useVictoryChartRenderArgs();
    const yKey = getYKey(tnode);
    const {nodeStyles} = parseStyles(tnode);
    const barWidth = parseAttributeAsNumber(tnode.attributes.barwidth);
    return (
        <Bar
            points={points[yKey]}
            chartBounds={chartBounds}
            color={nodeStyles.fill ?? VictoryTheme.colors.default}
            innerPadding={BAR_INNER_PADDING}
            roundedCorners={parseCornerRadius(tnode.attributes.cornerradius, pixelScale)}
            barWidth={scalePixels(barWidth, pixelScale)}
        />
    );
}

VictoryChartBar.displayName = 'VictoryChartBar';

export default VictoryChartBar;
