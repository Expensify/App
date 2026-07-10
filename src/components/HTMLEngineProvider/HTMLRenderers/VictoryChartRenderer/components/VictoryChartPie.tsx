import {useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import {POLAR_CONTAINER_HEIGHT_RATIO} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseShiftedLineSegmentNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/shiftedLineSegmentParser';
import parseVictoryLabelNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLabelParser';
import type {PolarChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computePieLabelLayout, {computeLabelBlockHeight, computeSliceAngles} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computePieLabelLayout';
import type {PieSliceValue} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computePieLabelLayout';
import convertAngleToArcLength from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/convertAngleToArcLength';
import {parseAttributeAsNumber, parseAttributeAsStringArray} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseComponent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseComponent';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';

import useTheme from '@hooks/useTheme';

import type {TNode} from 'react-native-render-html';

import React, {useMemo} from 'react';
import {HTMLContentModel, useAmbientTRenderEngine} from 'react-native-render-html';
import {Pie} from 'victory-native';

import VictoryChartPieLabel from './VictoryChartPieLabel';

type VictoryChartPieProps = {tnode: TNode};

// Victory Chart's 0° angle is equivalent to 270° in Victory Native
const START_ANGLE = 270;

// The chart title sits at y=40 and the "As of:" subtitle at y=62 (~11px font) — keep label blocks
// below that, with a small buffer, so a label stacked at the very top of a column can't overlap it.
const TITLE_SAFE_TOP = 75;

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const {data, chartContainerStyles, chartContentStyles} = useVictoryChartContext();
    const theme = useTheme();
    const typefaces = useChartTypefaces();
    const renderEngine = useAmbientTRenderEngine();
    const labelComponentNode = parseComponent(tnode.attributes.labelcomponent, renderEngine, 'victorylabel', HTMLContentModel.textual);
    const baseLabelItem = labelComponentNode ? parseVictoryLabelNode(labelComponentNode).labelItems?.at(0) : undefined;
    const pieLabels = parseAttributeAsStringArray(tnode.attributes.labels);
    const labelRadius = parseAttributeAsNumber(tnode.attributes.labelradius);
    const innerRadius = parseAttributeAsNumber(tnode.attributes.innerradius);
    const padAngle = parseAttributeAsNumber(tnode.attributes.padangle);
    const radius = parseAttributeAsNumber(tnode.attributes.radius);
    const effectiveLabelRadius = labelRadius ?? radius;
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

    const customLabelByDataLabel: Record<string, string | undefined> = {};
    const sliceValues: PieSliceValue[] = [];

    for (const [index, entry] of Object.values(data).entries()) {
        const polarEntry = entry as PolarChartData;
        const dataLabel = String(polarEntry.label);
        customLabelByDataLabel[dataLabel] = pieLabels?.[index];
        sliceValues.push({label: dataLabel, value: polarEntry.value});
    }

    const resolvedLabelLayout = useMemo(() => {
        if (!baseLabelItem || !effectiveLabelRadius) {
            return {};
        }

        const slices = computeSliceAngles(sliceValues, START_ANGLE);
        const rowHeight = computeLabelBlockHeight(baseLabelItem, typefaces);
        const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
        // Polar chart containers clip their bottom (1 - POLAR_CONTAINER_HEIGHT_RATIO) — labels must stay above that line or they render off-screen.
        // The pie's center sits at designHeight / 2 (victory-native's own layout math), so both the
        // clip line and the title clearance are expressed relative to that same absolute reference.
        const plotBounds = designHeight
            ? {
                  top: Math.max(-Math.min(designHeight / 2, effectiveLabelRadius), TITLE_SAFE_TOP + rowHeight / 2 - designHeight / 2),
                  bottom: Math.min(designHeight * (POLAR_CONTAINER_HEIGHT_RATIO - 0.5), effectiveLabelRadius),
              }
            : {top: -effectiveLabelRadius, bottom: effectiveLabelRadius};

        return computePieLabelLayout({slices, rowHeight, labelRadius: effectiveLabelRadius, plotBounds});
    }, [sliceValues, baseLabelItem, effectiveLabelRadius, typefaces, chartContentStyles.height]);

    return (
        <Pie.Chart
            startAngle={START_ANGLE}
            innerRadius={innerRadius}
            size={size}
        >
            {({slice}) => {
                const resolvedLabel = resolvedLabelLayout[slice.label];

                return (
                    <>
                        <Pie.Slice>
                            {!!baseLabelItem && !!resolvedLabel && (
                                <VictoryChartPieLabel
                                    slice={slice}
                                    baseLabelItem={baseLabelItem}
                                    label={customLabelByDataLabel[slice.label] ?? slice.label}
                                    labelRadius={labelRadius}
                                    resolvedLabel={{
                                        x: slice.center.x + resolvedLabel.relativeX,
                                        y: slice.center.y + resolvedLabel.relativeY,
                                        textAnchor: resolvedLabel.textAnchor,
                                    }}
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
        </Pie.Chart>
    );
}

export default VictoryChartPie;
