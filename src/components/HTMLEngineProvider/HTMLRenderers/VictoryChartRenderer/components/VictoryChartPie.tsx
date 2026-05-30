import React from 'react';
import type {TNode} from 'react-native-render-html';
import {useAmbientTRenderEngine} from 'react-native-render-html';
import {Pie} from 'victory-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseVictoryLabelNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLabelParser';
import type {PolarChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import convertAngleToArcLength from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/convertAngleToArcLength';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseComponent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseComponent';
import VictoryChartPieLabel from './VictoryChartPieLabel';

type VictoryChartPieProps = {tnode: TNode};

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

// Victory Chart's padAngle do not support fill color so it's always transparent
const ANGULAR_STROKE_COLOR = 'transparent';

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const {data} = useVictoryChartContext();
    const renderEngine = useAmbientTRenderEngine();
    const labelComponentNode = parseComponent(tnode.attributes.labelcomponent, renderEngine, 'victorylabel');
    const baseLabelItem = labelComponentNode ? parseVictoryLabelNode(labelComponentNode).labelItems?.at(0) : undefined;
    const dataLabels = Object.values(data).map((entry) => (entry as PolarChartData).label);
    const pieLabels = parseAttribute<string[]>(tnode.attributes.labels);
    const labelRadius = tnode.attributes.labelradius !== undefined ? Number(parseAttribute(tnode.attributes.labelradius)) : undefined;
    const innerRadius = tnode.attributes.innerradius !== undefined ? Number(parseAttribute(tnode.attributes.innerradius)) : undefined;
    const padAngle = tnode.attributes.padangle !== undefined ? Number(parseAttribute(tnode.attributes.padangle)) : undefined;
    const radius = tnode.attributes.radius !== undefined ? Number(parseAttribute(tnode.attributes.radius)) : undefined;
    const size = radius ? radius * 2 : undefined;
    const angularStrokeWidth = padAngle && radius ? convertAngleToArcLength(padAngle, radius) : 0;

    return (
        <Pie.Chart
            startAngle={START_ANGLE}
            innerRadius={innerRadius}
            size={size}
        >
            {({slice}) => (
                <>
                    <Pie.Slice>
                        {!!baseLabelItem && (
                            <VictoryChartPieLabel
                                slice={slice}
                                baseLabelItem={baseLabelItem}
                                label={pieLabels?.[dataLabels.indexOf(slice.label)]}
                                labelRadius={labelRadius}
                            />
                        )}
                    </Pie.Slice>
                    <Pie.SliceAngularInset
                        angularInset={{
                            angularStrokeWidth: angularStrokeWidth,
                            angularStrokeColor: ANGULAR_STROKE_COLOR,
                        }}
                    />
                </>
            )}
        </Pie.Chart>
    );
}

VictoryChartPie.displayName = 'VictoryChartPie';

export default VictoryChartPie;
