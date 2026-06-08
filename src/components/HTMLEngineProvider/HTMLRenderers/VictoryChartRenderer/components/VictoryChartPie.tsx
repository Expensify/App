import React from 'react';
import type {TNode} from 'react-native-render-html';
import {HTMLContentModel, useAmbientTRenderEngine} from 'react-native-render-html';
import {Pie} from 'victory-native';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseShiftedLineSegmentNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/shiftedLineSegmentParser';
import parseVictoryLabelNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLabelParser';
import type {PolarChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import convertAngleToArcLength from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/convertAngleToArcLength';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseComponent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseComponent';
import VictoryChartPieLabel from './VictoryChartPieLabel';

type VictoryChartPieProps = {tnode: TNode};

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

/** Alternating multipliers for pie slice label distance (base `labelradius` from HTML). */
const EVEN_SLICE_LABEL_RADIUS_FACTOR = 1;
const ODD_SLICE_LABEL_RADIUS_FACTOR = 0.8;

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const {data, chartContainerStyles} = useVictoryChartContext();
    const renderEngine = useAmbientTRenderEngine();
    const labelComponentNode = parseComponent(tnode.attributes.labelcomponent, renderEngine, 'victorylabel', HTMLContentModel.textual);
    const baseLabelItem = labelComponentNode ? parseVictoryLabelNode(labelComponentNode).labelItems?.at(0) : undefined;
    const pieLabels = parseAttribute<string[]>(tnode.attributes.labels);
    const labelRadius = tnode.attributes.labelradius !== undefined ? Number(parseAttribute(tnode.attributes.labelradius)) : undefined;
    const innerRadius = tnode.attributes.innerradius !== undefined ? Number(parseAttribute(tnode.attributes.innerradius)) : undefined;
    const padAngle = tnode.attributes.padangle !== undefined ? Number(parseAttribute(tnode.attributes.padangle)) : undefined;
    const radius = tnode.attributes.radius !== undefined ? Number(parseAttribute(tnode.attributes.radius)) : undefined;
    const size = radius ? radius * 2 : undefined;
    const angularStrokeWidth = padAngle && radius ? 2 * convertAngleToArcLength(padAngle, radius) : 0;
    const angularStrokeColor = typeof chartContainerStyles.backgroundColor === 'string' ? chartContainerStyles.backgroundColor : VictoryTheme.colors.default;
    const labelIndicatorNode = parseComponent(tnode.attributes.labelindicator, renderEngine, 'shiftedlinesegment', HTMLContentModel.block);
    const labelIndicatorStyles = labelIndicatorNode ? parseShiftedLineSegmentNode(labelIndicatorNode) : undefined;
    const {xShift: labelIndicatorXShift, yShift: labelIndicatorYShift, stroke: labelIndicatorStroke, strokeWidth: labelIndicatorStrokeWidth} = labelIndicatorStyles ?? {};
    const labelIndicatorInnerOffset = tnode.attributes.labelindicatorinneroffset !== undefined ? Number(parseAttribute(tnode.attributes.labelindicatorinneroffset)) : undefined;
    const labelIndicatorOuterOffset = tnode.attributes.labelindicatorouteroffset !== undefined ? Number(parseAttribute(tnode.attributes.labelindicatorouteroffset)) : undefined;
    const perSliceData = Object.values(data)
        .map((entry) => (entry as PolarChartData).label)
        .reduce(
            (slicesData, dataLabel, index) => {
                // eslint-disable-next-line no-param-reassign
                slicesData[dataLabel] = {
                    customLabel: pieLabels?.[index],
                    customLabelRadius: labelRadius ? labelRadius * (index % 2 === 0 ? EVEN_SLICE_LABEL_RADIUS_FACTOR : ODD_SLICE_LABEL_RADIUS_FACTOR) : undefined,
                };
                return slicesData;
            },
            {} as Record<string, {customLabelRadius: number | undefined; customLabel: string | undefined}>,
        );

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
                                label={perSliceData[slice.label].customLabel ?? slice.label}
                                labelRadius={perSliceData[slice.label].customLabelRadius}
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
            )}
        </Pie.Chart>
    );
}

export default VictoryChartPie;
