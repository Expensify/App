import React from 'react';
import type {TNode} from 'react-native-render-html';
import {Pie} from 'victory-native';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import VictoryChartPieLabel from './VictoryChartPieLabel';

type VictoryChartPieProps = {tnode: TNode};

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const innerRadius = tnode.attributes.innerradius !== undefined ? Number(parseAttribute(tnode.attributes.innerradius)) : undefined;
    const radius = tnode.attributes.radius !== undefined ? Number(parseAttribute(tnode.attributes.radius)) : undefined;
    const size = radius ? radius * 2 : undefined;

    return (
        <Pie.Chart
            startAngle={START_ANGLE}
            innerRadius={innerRadius}
            size={size}
        >
            {({slice}) => (
                <Pie.Slice>
                    <VictoryChartPieLabel
                        tnode={tnode}
                        slice={slice}
                    />
                </Pie.Slice>
            )}
        </Pie.Chart>
    );
}

VictoryChartPie.displayName = 'VictoryChartPie';

export default VictoryChartPie;
