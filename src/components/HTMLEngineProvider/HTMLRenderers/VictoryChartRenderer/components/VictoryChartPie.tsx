import {Skia} from '@shopify/react-native-skia';
import {parseDocument} from 'htmlparser2';
import React from 'react';
import {type TNode, useAmbientTRenderEngine} from 'react-native-render-html';
import {Pie, PolarChart} from 'victory-native';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import VictoryChartPieLabel from './VictoryChartPieLabel';

type VictoryChartPieProps = {tnode: TNode};

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const {data} = useVictoryChartContext();
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();
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
                <>
                    <Pie.Slice>
                        <VictoryChartPieLabel
                            tnode={tnode}
                            slice={slice}
                        />
                        <Pie.Label
                            font={boldTypeface ? Skia.Font(boldTypeface, 11) : null}
                            color={'black'}
                            radiusOffset={1.24}
                        />
                    </Pie.Slice>
                </>
            )}
        </Pie.Chart>
    );
}

VictoryChartPie.displayName = 'VictoryChartPie';

export default VictoryChartPie;
