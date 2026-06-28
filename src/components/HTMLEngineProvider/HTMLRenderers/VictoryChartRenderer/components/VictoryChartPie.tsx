import React from 'react';
import type {TNode} from 'react-native-render-html';
import {HTMLContentModel, useAmbientTRenderEngine} from 'react-native-render-html';
import {Pie} from 'victory-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseShiftedLineSegmentNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/shiftedLineSegmentParser';
import parseVictoryLabelNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLabelParser';
import type {PolarChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import convertAngleToArcLength from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/convertAngleToArcLength';
import {parseAttributeAsNumber, parseAttributeAsStringArray} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseComponent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseComponent';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import useTheme from '@hooks/useTheme';
import VictoryChartPieLabel from './VictoryChartPieLabel';

type VictoryChartPieProps = {tnode: TNode};

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

/** Alternating multipliers for pie slice label distance (base `labelradius` from HTML). */
const EVEN_SLICE_LABEL_RADIUS_FACTOR = 1;
const ODD_SLICE_LABEL_RADIUS_FACTOR = 0.8;

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const {data, chartContainerStyles} = useVictoryChartContext();
    const theme = useTheme();
    const renderEngine = useAmbientTRenderEngine();
    const labelComponentNode = parseComponent(tnode.attributes.labelcomponent, renderEngine, 'victorylabel', HTMLContentModel.textual);
    const baseLabelItem = labelComponentNode ? parseVictoryLabelNode(labelComponentNode).labelItems?.at(0) : undefined;
    const pieLabels = parseAttributeAsStringArray(tnode.attributes.labels);
    const labelRadius = parseAttributeAsNumber(tnode.attributes.labelradius);
    const innerRadius = parseAttributeAsNumber(tnode.attributes.innerradius);
    const padAngle = parseAttributeAsNumber(tnode.attributes.padangle);
    const radius = parseAttributeAsNumber(tnode.attributes.radius);
    const size = radius ? radius * 2 : undefined;
    const angularStrokeWidth = padAngle && radius ? 2 * convertAngleToArcLength(padAngle, radius) : 0;
    const resolvedBgColor = resolveChartThemeColor(typeof chartContainerStyles.backgroundColor === 'string' ? chartContainerStyles.backgroundColor : undefined, theme);
    const angularStrokeColor = resolvedBgColor ?? theme.cardBG;
    const labelIndicatorNode = parseComponent(tnode.attributes.labelindicator, renderEngine, 'shiftedlinesegment', HTMLContentModel.block);
    const labelIndicatorStyles = labelIndicatorNode ? parseShiftedLineSegmentNode(labelIndicatorNode) : undefined;
    const {xShift: labelIndicatorXShift, yShift: labelIndicatorYShift, strokeWidth: labelIndicatorStrokeWidth} = labelIndicatorStyles ?? {};
    const labelIndicatorStroke = resolveChartThemeColor(labelIndicatorStyles?.stroke, theme);
    const labelIndicatorInnerOffset = parseAttributeAsNumber(tnode.attributes.labelindicatorinneroffset);
    const labelIndicatorOuterOffset = parseAttributeAsNumber(tnode.attributes.labelindicatorouteroffset);
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
