import {Skia} from '@shopify/react-native-skia';
import React from 'react';
import type {TNode} from 'react-native-render-html';
import {Pie, PolarChart} from 'victory-native';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

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
            circleSweepDegrees={360}
        >
            {() => (
                <>
                    <Pie.Slice>
                        <Pie.Label
                            font={regularTypeface ? Skia.Font(regularTypeface, 20) : null}
                            color={'green'}
                        />
                    </Pie.Slice>
                </>
            )}
        </Pie.Chart>
    );
}

VictoryChartPie.displayName = 'VictoryChartPie';

export default VictoryChartPie;
