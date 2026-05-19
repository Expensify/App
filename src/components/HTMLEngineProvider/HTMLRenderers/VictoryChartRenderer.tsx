import {Circle, type Color, listFontFamilies, matchFont, Paragraph, type SkFont, Skia, Text as SkText, SkTypeface, type SkTypefaceFontProvider} from '@shopify/react-native-skia';
import JSON5 from 'json5';
import lodashIsObject from 'lodash/isObject';
import lodashMerge from 'lodash/merge';
import React, {ComponentProps, Fragment, useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ColorValue, TextStyle, ViewStyle} from 'react-native';
import {type CustomRendererProps, type TBlock, TNode, TNodeChildrenRenderer} from 'react-native-render-html';
import type {CartesianChartRenderArg, ChartBounds, PointsArray, RoundedCorners} from 'victory-native';
import {Bar, CartesianChart, Line} from 'victory-native';
import {BAR_INNER_PADDING} from '@components/Charts/BarChart/BarChartContent';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {DEFAULT_CHART_COLOR} from '@components/Charts/utils';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isArchivedNonExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';

const X_KEY = 'x';
const Y_KEY_PREFIX = 'y';

type RawData = Record<string, any>;

type LabelItem = {
    /** Position on the X-axis */
    x: number;

    /** Position on the Y-axis */
    y: number;

    /** Text to draw */
    text: string;

    /** The color of the text */
    color: Color;

    /** Font size */
    fontSize: number;

    /** Font weight */
    fontWeight: 'normal' | 'bold';
};

type LegendItemEntry = {
    /** Text to draw */
    text: string;

    /** The color of the text */
    color: Color;

    /** Font size */
    fontSize: number;

    /** Font weight */
    fontWeight: 'normal' | 'bold';

    /** The color of the symbol */
    symbolColor: Color;

    /** Symbol size */
    symbolSize: number;
};

type LegendItem = {
    /** Position on the X-axis */
    x: number;

    /** Position on the Y-axis */
    y: number;

    /** Legend entries */
    entries: LegendItemEntry[];

    /** Space between entries */
    gutter: number;

    /** Space between entry's text and symbol */
    symbolSpacer: number;
};

/**
 * Get node unique ID based on hierarchy
 */
function getHierarchyID(tnode: TNode): string {
    let id = String(tnode.nodeIndex);
    let parent = tnode.parent;
    while (parent) {
        id = `${parent.nodeIndex}-${id}`;
        parent = parent.parent;
    }
    return id;
}

/**
 * Traverse all nodes to extract points from `data` attributes and other config e.g. axis configuration
 */
function processNode(tnode: TNode, typeface: SkTypeface | null) {
    const data: Record<string, RawData> = {};
    const xKey: string = X_KEY;
    const yKeys: string[] = [];
    let xAxis: ComponentProps<typeof CartesianChart<RawData, string, string>>['xAxis'];
    let yAxis: ComponentProps<typeof CartesianChart<RawData, string, string>>['yAxis'];
    const labelItems: LabelItem[] = [];
    const legendItems: LegendItem[] = [];

    if (tnode.tagName === 'victorybar' || tnode.tagName === 'victorychart') {
        const parsedData = parseAttribute(tnode.attributes.data);
        if (Array.isArray(parsedData)) {
            const yKey = Y_KEY_PREFIX + getHierarchyID(tnode);
            yKeys.push(yKey);
            (parsedData as RawData[]).forEach((point) => {
                data[point.x] = {
                    [xKey]: point.x,
                    [yKey]: point.y,
                };
            });
        }
    } else if (tnode.tagName === 'victoryaxis') {
        const isDependentAxis = 'dependentaxis' in tnode.attributes && tnode.attributes.dependentaxis !== 'false';
        const tickCount = parseAttribute(tnode.attributes.tickcount);
        const tickValues = parseAttribute(tnode.attributes.tickvalues);
        const orientation = parseAttribute(tnode.attributes.orientation);
        const style = parseAttribute(tnode.attributes.style);
        // s77rt clean up the `let`s and nested code
        let lineColor: Color | undefined;
        let lineWidth: number | undefined;
        let labelColor: string | undefined;
        let labelOffset: number | undefined;
        let fontSize: number | undefined;
        if (lodashIsObject(style)) {
            // VC uses separate colors for axis and grid but VN uses a unifed one.
            if ('grid' in style && lodashIsObject(style.grid)) {
                lineColor ??= 'stroke' in style.grid ? (style.grid.stroke as Color) : undefined;
                lineWidth ??= 'strokeWidth' in style.grid ? Number(style.grid.strokeWidth) : undefined;
            }
            if ('axis' in style && lodashIsObject(style.axis)) {
                lineColor ??= 'stroke' in style.axis ? (style.axis.stroke as Color) : undefined;
                lineWidth ??= 'strokeWidth' in style.axis ? Number(style.axis.strokeWidth) : undefined;
            }
            if ('tickLabels' in style && lodashIsObject(style.tickLabels)) {
                labelColor ??= 'fill' in style.tickLabels ? String(style.tickLabels.fill) : undefined;
                labelOffset ??= 'padding' in style.tickLabels ? Number(style.tickLabels.padding) : undefined;
                fontSize ??= 'fontSize' in style.tickLabels ? Number(style.tickLabels.fontSize) : undefined;
            }
        }
        const font = typeface ? Skia.Font(typeface, fontSize) : null;
        if (isDependentAxis) {
            yAxis = [
                {
                    tickCount,
                    tickValues,
                    axisSide: orientation === 'right' ? 'right' : 'left',
                    lineColor,
                    lineWidth,
                    labelColor,
                    labelOffset,
                    font,
                },
            ];
        } else {
            xAxis = {
                tickCount,
                tickValues,
                axisSide: orientation === 'top' ? 'top' : 'bottom',
                lineColor,
                lineWidth,
                labelColor,
                labelOffset,
                font,
            };
        }
    } else if (tnode.tagName === 'victorylabel') {
        const x = parseAttribute(tnode.attributes.x);
        const y = parseAttribute(tnode.attributes.y);
        const text = parseAttribute(tnode.attributes.text);
        const style = parseAttribute(tnode.attributes.style);
        let color: Color = 'black';
        let fontSize: number = 16;
        let fontWeight: 'normal' | 'bold' = 'normal';
        if (lodashIsObject(style)) {
            if ('fill' in style) {
                color = style.fill as Color;
            }
            if ('fontSize' in style) {
                fontSize = Number(style.fontSize);
            }
            if ('fontWeight' in style && Number(style.fontWeight) === 700) {
                fontWeight = 'bold';
            }
        }
        labelItems.push({
            x,
            y,
            text,
            color,
            fontSize,
            fontWeight,
        });
    } else if (tnode.tagName === 'victorylegend') {
        const x = parseAttribute(tnode.attributes.x);
        const y = parseAttribute(tnode.attributes.y);
        const gutter = parseAttribute(tnode.attributes.gutter);
        const symbolSpacer = parseAttribute(tnode.attributes.symbolspacer);
        const data = parseAttribute(tnode.attributes.data);
        const style = parseAttribute(tnode.attributes.style);
        let color: Color = 'black';
        let fontSize: number = 13;
        let fontWeight: 'normal' | 'bold' = 'normal';
        if (lodashIsObject(style) && 'labels' in style && lodashIsObject(style.labels)) {
            if ('fill' in style.labels) {
                color = style.labels.fill as Color;
            }
            if ('fontSize' in style.labels) {
                fontSize = Number(style.labels.fontSize);
            }
            if ('fontWeight' in style.labels && Number(style.labels.fontWeight) === 700) {
                fontWeight = 'bold';
            }
        }
        const entries: LegendItemEntry[] = [];
        if (Array.isArray(data)) {
            (data as Array<Record<string, any>>).forEach((entry) => {
                const text = entry.name;
                const symbolColor: Color = entry.symbol?.fill ?? 'black';
                const symbolSize: number = Number(entry.symbol?.size ?? 6);
                entries.push({
                    text,
                    color,
                    fontSize,
                    fontWeight,
                    symbolColor,
                    symbolSize,
                });
            });
        }
        legendItems.push({
            x,
            y,
            entries,
            gutter,
            symbolSpacer,
        });
    }

    tnode.children.forEach((child) => {
        const childData = processNode(child, typeface);
        yKeys.push(...childData.yKeys);
        if (childData.xAxis) {
            // It's safe to replace because there should be at most one xAxis
            xAxis = childData.xAxis;
        }
        if (childData.yAxis) {
            if (!yAxis) {
                yAxis = [];
            }
            yAxis.push(...childData.yAxis);
        }
        labelItems.push(...childData.labelItems);
        legendItems.push(...childData.legendItems);
        lodashMerge(data, childData.data);
    });

    return {
        data,
        xKey,
        yKeys,
        xAxis,
        yAxis,
        labelItems,
        legendItems,
    };
}

/**
 * Parse attribute as JSON or fallback to input as is
 * Example: "20" -> 20
 *        : "[ {x: 'Jan', y: 3} ]" -> `[{"x": "Jan", "y": 3}]` (Valid RFC 8259)
 *        : "Green" -> "Green"
 */
function parseAttribute(attribute: string): any {
    if (!attribute) {
        return undefined;
    }
    try {
        return JSON5.parse(attribute);
    } catch {
        return attribute;
    }
}

/**
 * Helper to parse VC's `cornerRadius` into VN's `roundedCorners`
 */
function parseCornerRadius(attribute: string): RoundedCorners | undefined {
    const cornerRadius = parseAttribute(attribute);
    if (typeof cornerRadius === 'number') {
        return {
            topLeft: cornerRadius,
            topRight: cornerRadius,
            bottomLeft: cornerRadius,
            bottomRight: cornerRadius,
        };
    }
    if (lodashIsObject(cornerRadius)) {
        return {
            topLeft: 'topLeft' in cornerRadius ? Number(cornerRadius.topLeft) : 'top' in cornerRadius ? Number(cornerRadius.top) : undefined,
            topRight: 'topRight' in cornerRadius ? Number(cornerRadius.topRight) : 'top' in cornerRadius ? Number(cornerRadius.top) : undefined,
            bottomLeft: 'bottomLeft' in cornerRadius ? Number(cornerRadius.bottomLeft) : 'bottom' in cornerRadius ? Number(cornerRadius.bottom) : undefined,
            bottomRight: 'bottomRight' in cornerRadius ? Number(cornerRadius.bottomRight) : 'bottom' in cornerRadius ? Number(cornerRadius.bottom) : undefined,
        };
    }
    return undefined;
}

/**
 * Helper to parse VC's `domainPadding` into VN's `domainPadding`
 */
function parseDomainPadding(attribute: string): ComponentProps<typeof CartesianChart<RawData, string, string>>['domainPadding'] | undefined {
    const domainPadding = parseAttribute(attribute);
    if (typeof domainPadding === 'number') {
        return domainPadding;
    }
    if (Array.isArray(domainPadding)) {
        return {
            left: domainPadding[0],
            right: domainPadding[1],
        };
    }
    if (lodashIsObject(domainPadding)) {
        let left: number | undefined, right: number | undefined, top: number | undefined, bottom: number | undefined;
        if ('x' in domainPadding && typeof domainPadding.x === 'number') {
            left = domainPadding.x;
            right = domainPadding.x;
        } else if ('x' in domainPadding && Array.isArray(domainPadding.x)) {
            left = domainPadding.x[0];
            right = domainPadding.x[1];
        }
        if ('y' in domainPadding && typeof domainPadding.y === 'number') {
            top = domainPadding.y;
            bottom = domainPadding.y;
        } else if ('y' in domainPadding && Array.isArray(domainPadding.y)) {
            top = domainPadding.y[1];
            bottom = domainPadding.y[0];
        }
        return {
            left,
            right,
            top,
            bottom,
        };
    }
    return undefined;
}

/**
 * Helper to parse common styles
 */
function parseStyles(tnode: TNode) {
    const nodeStyles: ViewStyle = {};
    const parentNodeStyles: ViewStyle = {};

    const parsedHeight = parseAttribute(tnode.attributes.height);
    if (typeof parsedHeight === 'number') {
        nodeStyles.height = parsedHeight;
    }
    const parsedWidth = parseAttribute(tnode.attributes.width);
    if (typeof parsedWidth === 'number') {
        nodeStyles.width = parsedWidth;
    }

    const parsedStyle = parseAttribute(tnode.attributes.style);
    if (lodashIsObject(parsedStyle)) {
        if ('parent' in parsedStyle && lodashIsObject(parsedStyle.parent)) {
            Object.assign(parentNodeStyles, parsedStyle.parent);
        }
        if ('data' in parsedStyle && lodashIsObject(parsedStyle.data)) {
            Object.assign(nodeStyles, parsedStyle.data);
        }
    }

    return {nodeStyles, parentNodeStyles};
}

function VictoryChartRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();
    const {data, xKey, yKeys, xAxis, yAxis, labelItems, legendItems} = useMemo(() => processNode(tnode, regularTypeface), [tnode, regularTypeface]);
    const {nodeStyles, parentNodeStyles} = useMemo(() => parseStyles(tnode), [tnode]);

    const renderCartesianChartChild = useCallback((tnode: TNode, index: Number, renderArgs: CartesianChartRenderArg<RawData, string>) => {
        const key = `${tnode.tagName ?? 'node'}-${index}`;
        const yKey = Y_KEY_PREFIX + getHierarchyID(tnode);
        const {points, chartBounds} = renderArgs;
        const {nodeStyles} = parseStyles(tnode);
        switch (tnode.tagName) {
            case 'victorybar':
                return (
                    <Bar
                        key={key}
                        points={points[yKey]}
                        chartBounds={chartBounds}
                        color={nodeStyles.fill ?? DEFAULT_CHART_COLOR}
                        innerPadding={BAR_INNER_PADDING}
                        roundedCorners={parseCornerRadius(tnode.attributes.cornerradius)}
                        barWidth={parseAttribute(tnode.attributes.barwidth)}
                    >
                        {tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
                    </Bar>
                );
            case 'victoryline':
                return (
                    <Line
                        key={key}
                        points={points[yKey]}
                        color={nodeStyles.fill ?? DEFAULT_CHART_COLOR}
                        strokeWidth={2}
                        curveType="linear"
                    >
                        {tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
                    </Line>
                );
            default:
                return null;
        }
    }, []);

    const renderOutside = useCallback(
        (renderArgs: CartesianChartRenderArg<RawData, string>) => {
            return (
                <>
                    {labelItems.map(({x, y, text, color, fontSize, fontWeight}) => {
                        const typeface = fontWeight === 'bold' ? boldTypeface : regularTypeface;
                        const font = typeface ? Skia.Font(typeface, fontSize) : null;
                        return (
                            <SkText
                                key={`text-${x}-${y}`}
                                x={x}
                                y={y}
                                text={text}
                                font={font}
                                color={color}
                            />
                        );
                    })}
                    {legendItems.map(({x: startX, y, entries, gutter, symbolSpacer}, legendIndex) => {
                        let x = startX;
                        return entries.map(({text, color, fontSize, fontWeight, symbolColor, symbolSize}) => {
                            const typeface = fontWeight === 'bold' ? boldTypeface : regularTypeface;
                            const font = typeface ? Skia.Font(typeface, fontSize) : null;
                            const fontMetrics = font?.getMetrics();
                            const lineHeight = fontMetrics ? fontMetrics.ascent + fontMetrics.descent + fontMetrics.leading : 0;
                            const symbolX = x;
                            x += symbolSize + symbolSpacer;
                            const textX = x;
                            x += (font?.getGlyphWidths(font.getGlyphIDs(text)).reduce((acc, width) => acc + width, 0) ?? 0) + gutter;
                            return (
                                <Fragment key={`legend-${legendIndex}-${x}-${y}`}>
                                    <Circle
                                        cx={symbolX}
                                        cy={y}
                                        r={symbolSize}
                                        color={symbolColor}
                                    />
                                    <SkText
                                        x={textX}
                                        y={y - lineHeight / 2}
                                        text={text}
                                        font={font}
                                        color={color}
                                    />
                                </Fragment>
                            );
                        });
                    })}
                </>
            );
        },
        [labelItems, legendItems, regularTypeface, boldTypeface],
    );

    return (
        <View style={[styles.chartContainer, styles.mw100, parentNodeStyles]}>
            <View style={[styles.chartContent, styles.mw100, nodeStyles]}>
                <CartesianChart
                    data={Object.values(data)}
                    xKey={xKey}
                    yKeys={yKeys}
                    xAxis={xAxis}
                    yAxis={yAxis}
                    domain={parseAttribute(tnode.attributes.domain)}
                    domainPadding={parseDomainPadding(tnode.attributes.domainpadding)}
                    padding={parseAttribute(tnode.attributes.padding)}
                    renderOutside={renderOutside}
                >
                    {(renderArgs) => tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
                </CartesianChart>
            </View>
        </View>
    );
}

export default VictoryChartRenderer;
