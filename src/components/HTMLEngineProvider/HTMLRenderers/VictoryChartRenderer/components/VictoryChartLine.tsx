import VictoryTheme from '@components/Charts/VictoryTheme';
import {useVictoryChartRenderArgs} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseCurveType from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseCurveType';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

import type {TNode} from 'react-native-render-html';

import React from 'react';
import {Line} from 'victory-native';

type VictoryChartLineProps = {tnode: TNode};

function VictoryChartLine({tnode}: VictoryChartLineProps) {
    const {points} = useVictoryChartRenderArgs();
    const yKey = getYKey(tnode);
    const {nodeStyles} = parseStyles(tnode);
    return (
        <Line
            points={points[yKey]}
            color={nodeStyles.stroke ?? VictoryTheme.colors.default}
            strokeWidth={nodeStyles.strokeWidth !== undefined ? Number(nodeStyles.strokeWidth) : undefined}
            curveType={parseCurveType(tnode.attributes.interpolation)}
        />
    );
}

VictoryChartLine.displayName = 'VictoryChartLine';

export default VictoryChartLine;
