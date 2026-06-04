import React from 'react';
import {useAmbientTRenderEngine} from 'react-native-render-html';
import type {TNode} from 'react-native-render-html';
import {Pie} from 'victory-native';
import parseVictoryLabelNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLabelParser';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseComponent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseComponent';
import VictoryChartPieLabel from './VictoryChartPieLabel';

type VictoryChartPieProps = {tnode: TNode};

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

/** Alternating multipliers for pie slice label distance (base `labelradius` from HTML). */
const EVEN_SLICE_LABEL_RADIUS_FACTOR = 1;
const ODD_SLICE_LABEL_RADIUS_FACTOR = 0.8;

function getSliceLabelRadius(baseLabelRadius: number | undefined, sliceIndex: number): number | undefined {
    if (baseLabelRadius === undefined || sliceIndex < 0) {
        return baseLabelRadius;
    }

    const factor = sliceIndex % 2 === 0 ? EVEN_SLICE_LABEL_RADIUS_FACTOR : ODD_SLICE_LABEL_RADIUS_FACTOR;
    return baseLabelRadius * factor;
}

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const renderEngine = useAmbientTRenderEngine();
    const labelComponentNode = parseComponent(tnode.attributes.labelcomponent, renderEngine, 'victorylabel');
    const labelItemTemplate = labelComponentNode ? parseVictoryLabelNode(labelComponentNode).labelItems?.at(0) : undefined;

    const innerRadius = tnode.attributes.innerradius !== undefined ? Number(parseAttribute(tnode.attributes.innerradius)) : undefined;
    const radius = tnode.attributes.radius !== undefined ? Number(parseAttribute(tnode.attributes.radius)) : undefined;
    const size = radius ? radius * 2 : undefined;

    return (
        <Pie.Chart
            startAngle={START_ANGLE}
            innerRadius={innerRadius}
            size={size}
        >
<<<<<<< Updated upstream
            {({slice}) => (
                <Pie.Slice>
                    <VictoryChartPieLabel
                        tnode={tnode}
                        slice={slice}
                        labelItemTemplate={labelItemTemplate}
                    />
                </Pie.Slice>
            )}
=======
            {({slice}) => {
                const sliceIndex = dataLabels.indexOf(slice.label);
                const sliceLabelRadius = getSliceLabelRadius(labelRadius, sliceIndex);

                return (
                <>
                    <Pie.Slice>
                        {!!baseLabelItem && (
                            <VictoryChartPieLabel
                                slice={slice}
                                baseLabelItem={baseLabelItem}
                                label={pieLabels?.[sliceIndex]}
                                labelRadius={sliceLabelRadius}
                                labelIndicatorXShift={labelIndicatorXShift}
                                labelIndicatorYShift={labelIndicatorYShift}
                                labelIndicatorStroke={labelIndicatorStroke}
                                labelIndicatorStrokeWidth={labelIndicatorStrokeWidth}
                                labelIndicatorInnerOffset={labelIndicatorInnerOffset}
                                labelIndicatorOuterOffset={labelIndicatorOuterOffset}
                            />
                        )}
                    </Pie.Slice>
                    <Pie.SliceAngularInset
                        angularInset={{
                            angularStrokeWidth,
                            angularStrokeColor,
                        }}
                    />
                </>
                );
            }}
>>>>>>> Stashed changes
        </Pie.Chart>
    );
}

export default VictoryChartPie;
