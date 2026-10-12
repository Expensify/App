import {useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import {POLAR_CONTAINER_HEIGHT_RATIO} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseShiftedLineSegmentNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/shiftedLineSegmentParser';
import parseVictoryLabelNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLabelParser';
import type {PolarChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computePieLabelLayout, {
    computeLabelBlockHeight,
    computeSliceAngles,
    computeTextRadiusBySide,
} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computePieLabelLayout';
import type {PieSliceValue} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computePieLabelLayout';
import convertAngleToArcLength from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/convertAngleToArcLength';
import {parseAttributeAsNumber, parseAttributeAsStringArray} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseComponent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseComponent';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import scalePixels from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/scalePixels';
import {scaleLabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/scaleVictoryChartContextValue';

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

// The title/subtitle are left-aligned at the same x the left column's labels end at, so add padding to the left column labels so a label
// stacked right at TITLE_SAFE_TOP reads as cramped against them even without overlapping.
const LEFT_COLUMN_TOP_PADDING = 24;

// The title/subtitle sit x=32 from the left edge, so every other label uses that same distance from
// its nearest edge (bottom, left, or right) for a consistent margin - instead of a label stacked at
// the very bottom of a column, or a long label in a column's text, rendering flush against the edge.
const EDGE_PADDING = 32;

function VictoryChartPie({tnode}: VictoryChartPieProps) {
    const {data, chartContainerStyles, chartContentStyles, pixelScale} = useVictoryChartContext();
    const theme = useTheme();
    const typefaces = useChartTypefaces();
    const renderEngine = useAmbientTRenderEngine();
    const labelComponentNode = parseComponent(tnode.attributes.labelcomponent, renderEngine, 'victorylabel', HTMLContentModel.textual);
    const rawBaseLabelItem = labelComponentNode ? parseVictoryLabelNode(labelComponentNode).labelItems?.at(0) : undefined;
    // All pie geometry is parsed from raw pixel attributes, so it must follow the context's pixel
    // scale for the expanded chart to render proportionally at its larger native size.
    const baseLabelItem = rawBaseLabelItem && pixelScale !== 1 ? scaleLabelItem(rawBaseLabelItem, pixelScale) : rawBaseLabelItem;
    const pieLabels = parseAttributeAsStringArray(tnode.attributes.labels);
    const rawLabelRadius = parseAttributeAsNumber(tnode.attributes.labelradius);
    const labelRadius = scalePixels(rawLabelRadius, pixelScale);
    const rawInnerRadius = parseAttributeAsNumber(tnode.attributes.innerradius);
    const innerRadius = scalePixels(rawInnerRadius, pixelScale);
    const padAngle = parseAttributeAsNumber(tnode.attributes.padangle);
    const rawRadius = parseAttributeAsNumber(tnode.attributes.radius);
    const radius = scalePixels(rawRadius, pixelScale);
    const effectiveLabelRadius = labelRadius ?? radius;
    const size = radius ? radius * 2 : undefined;
    const angularStrokeWidth = padAngle && radius ? 2 * convertAngleToArcLength(padAngle, radius) : 0;
    const resolvedBgColor = resolveChartThemeColor(typeof chartContainerStyles.backgroundColor === 'string' ? chartContainerStyles.backgroundColor : undefined, theme);
    const angularStrokeColor = resolvedBgColor ?? theme.cardBG;
    const labelIndicatorNode = parseComponent(tnode.attributes.labelindicator, renderEngine, 'shiftedlinesegment', HTMLContentModel.block);
    const labelIndicatorStyles = labelIndicatorNode ? parseShiftedLineSegmentNode(labelIndicatorNode) : undefined;
    const {xShift: rawIndicatorXShift, yShift: rawIndicatorYShift, strokeWidth: rawIndicatorStrokeWidth} = labelIndicatorStyles ?? {};
    const labelIndicatorXShift = scalePixels(rawIndicatorXShift, pixelScale);
    const labelIndicatorYShift = scalePixels(rawIndicatorYShift, pixelScale);
    const labelIndicatorStrokeWidth = scalePixels(rawIndicatorStrokeWidth, pixelScale);
    const labelIndicatorStroke = resolveChartThemeColor(labelIndicatorStyles?.stroke, theme);
    const rawIndicatorInnerOffset = parseAttributeAsNumber(tnode.attributes.labelindicatorinneroffset);
    const labelIndicatorInnerOffset = scalePixels(rawIndicatorInnerOffset, pixelScale);
    const rawIndicatorOuterOffset = parseAttributeAsNumber(tnode.attributes.labelindicatorouteroffset);
    const labelIndicatorOuterOffset = scalePixels(rawIndicatorOuterOffset, pixelScale);

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
        const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
        // Layout constants are design-space pixels, so they scale with the chart's pixel scale.
        const edgePadding = EDGE_PADDING * pixelScale;
        const scaledTitleSafeTop = TITLE_SAFE_TOP * pixelScale;
        const scaledLeftColumnTopPadding = LEFT_COLUMN_TOP_PADDING * pixelScale;
        const bottom = designHeight ? Math.min(designHeight * (POLAR_CONTAINER_HEIGHT_RATIO - 0.5) - rowHeight / 2 - edgePadding, effectiveLabelRadius) : effectiveLabelRadius;
        const topFor = (columnTitleSafeTop: number) =>
            designHeight ? Math.max(-Math.min(designHeight / 2, effectiveLabelRadius), columnTitleSafeTop + rowHeight / 2 - designHeight / 2) : -effectiveLabelRadius;
        const plotBounds = {
            left: {top: topFor(scaledTitleSafeTop + scaledLeftColumnTopPadding), bottom},
            right: {top: topFor(scaledTitleSafeTop), bottom},
        };
        const textRadius = computeTextRadiusBySide({
            slices,
            getText: (label) => customLabelByDataLabel[label] ?? label,
            baseLabelItem,
            typefaces,
            labelRadius: effectiveLabelRadius,
            designWidth,
            edgePadding,
        });

        return computePieLabelLayout({slices, rowHeight, labelRadius: effectiveLabelRadius, textRadius, plotBounds});
    }, [sliceValues, baseLabelItem, effectiveLabelRadius, typefaces, chartContentStyles.height, chartContentStyles.width, customLabelByDataLabel, pixelScale]);

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
                                    resolvedLabel={{
                                        x: slice.center.x + resolvedLabel.relativeX,
                                        y: slice.center.y + resolvedLabel.relativeY,
                                        textAnchor: resolvedLabel.textAnchor,
                                        midAngle: resolvedLabel.midAngle,
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
