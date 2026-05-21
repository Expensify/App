import {Circle, Skia, Text as SkText} from '@shopify/react-native-skia';
import type {SkTypeface} from '@shopify/react-native-skia';
import JSON5 from 'json5';
import lodashIsObject from 'lodash/isObject';
import lodashMerge from 'lodash/merge';
import React, {Fragment, useCallback, useMemo} from 'react';
import type {ComponentProps} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import type {TNode} from 'react-native-render-html';
import type {CartesianChartRenderArg, RoundedCorners} from 'victory-native';
import {Bar, CartesianChart, Line} from 'victory-native';
import {BAR_INNER_PADDING} from '@components/Charts/BarChart/BarChartContent';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {DEFAULT_CHART_COLOR} from '@components/Charts/utils';
import useThemeStyles from '@hooks/useThemeStyles';
import {X_KEY, Y_KEY_PREFIX} from './constants';
import type {
    CartesianChartData,
    LabelItem,
    LegendItem,
    LegendItemEntry,
    RawAxisStyle,
    RawChartData,
    RawLabelStyle,
    RawLegendData,
    RawLegendStyle,
    VictoryChartRendererProps,
    YKey,
} from './types';

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
 * Get the Y-axis key for a given node
 */
function getYKey(tnode: TNode): YKey {
    return `${Y_KEY_PREFIX}${getHierarchyID(tnode)}`;
}

/**
 * Traverse all nodes to extract points from `data` attributes and other config e.g. axis configuration
 */
function processNode(tnode: TNode, typeface: SkTypeface | null) {
    const data: Record<string, CartesianChartData> = {};
    const xKey = X_KEY;
    const yKeys: YKey[] = [];
    let xAxis: ComponentProps<typeof CartesianChart<CartesianChartData, keyof CartesianChartData, YKey>>['xAxis'];
    let yAxis: ComponentProps<typeof CartesianChart<CartesianChartData, keyof CartesianChartData, YKey>>['yAxis'];
    const labelItems: LabelItem[] = [];
    const legendItems: LegendItem[] = [];

    if (tnode.tagName === 'victorybar' || tnode.tagName === 'victoryline') {
        const points = parseAttribute<RawChartData[]>(tnode.attributes.data) ?? [];
        const yKey = getYKey(tnode);
        yKeys.push(yKey);
        for (const point of points) {
            data[point.x] = {
                [xKey]: point.x,
                [yKey]: point.y,
            } as CartesianChartData;
        }
    } else if (tnode.tagName === 'victoryaxis') {
        const isDependentAxis = 'dependentaxis' in tnode.attributes && tnode.attributes.dependentaxis !== 'false';
        const orientation = parseAttribute<string>(tnode.attributes.orientation);
        const tickCount = parseAttribute<number>(tnode.attributes.tickcount) ?? 0;
        const tickValues = parseAttribute<number[]>(tnode.attributes.tickvalues);
        const tickFormat = parseAttribute<string[]>(tnode.attributes.tickformat);
        const formatLabel = (label: string | number) => tickFormat?.[tickValues?.indexOf(Number(label)) ?? -1] ?? String(label);
        const style = parseAttribute<RawAxisStyle>(tnode.attributes.style);
        const lineColor = style?.grid?.stroke;
        const lineWidth = style?.grid?.strokeWidth !== undefined ? Number(style.grid.strokeWidth) : 0; // 0 Not to draw the lines for compatibility with VictoryChart
        const labelColor = style?.tickLabels?.fill !== undefined ? String(style.tickLabels.fill) : undefined;
        const labelOffset = style?.tickLabels?.padding !== undefined ? Number(style.tickLabels.padding) : undefined;
        const fontSize = style?.tickLabels?.fontSize !== undefined ? Number(style.tickLabels.fontSize) : undefined;
        const font = typeface ? Skia.Font(typeface, fontSize) : null;
        if (isDependentAxis) {
            yAxis = [
                {
                    tickCount,
                    tickValues,
                    formatYLabel: formatLabel,
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
                formatXLabel: formatLabel,
                axisSide: orientation === 'top' ? 'top' : 'bottom',
                lineColor,
                lineWidth,
                labelColor,
                labelOffset,
                font,
            };
        }
    } else if (tnode.tagName === 'victorylabel') {
        const x = parseAttribute<number>(tnode.attributes.x) ?? 0;
        const y = parseAttribute<number>(tnode.attributes.y) ?? 0;
        const text = parseAttribute<string>(tnode.attributes.text) ?? '';
        const style = parseAttribute<RawLabelStyle>(tnode.attributes.style);
        const color = style?.fill;
        const fontSize = style?.fontSize !== undefined ? Number(style.fontSize) : undefined;
        const fontWeight = Number(style?.fontWeight) === 700 ? 'bold' : undefined;
        labelItems.push({
            x,
            y,
            text,
            color,
            fontSize,
            fontWeight,
        });
    } else if (tnode.tagName === 'victorylegend') {
        const x = parseAttribute<number>(tnode.attributes.x) ?? 0;
        const y = parseAttribute<number>(tnode.attributes.y) ?? 0;
        const gutter = parseAttribute<number>(tnode.attributes.gutter) ?? undefined;
        const symbolSpacer = parseAttribute<number>(tnode.attributes.symbolspacer) ?? undefined;
        const style = parseAttribute<RawLegendStyle>(tnode.attributes.style);
        const color = style?.labels?.fill;
        const fontSize = style?.labels?.fontSize !== undefined ? Number(style.labels.fontSize) : undefined;
        const fontWeight = Number(style?.labels?.fontWeight) === 700 ? 'bold' : undefined;
        const entries: LegendItemEntry[] = (parseAttribute<RawLegendData[]>(tnode.attributes.data) ?? []).map((entry) => {
            const text = entry.name;
            const symbolColor = entry.symbol?.fill;
            const symbolSize = entry.symbol?.size !== undefined ? Number(entry.symbol.size) : undefined;
            return {
                text,
                color,
                fontSize,
                fontWeight,
                symbolColor,
                symbolSize,
            };
        });
        legendItems.push({
            x,
            y,
            entries,
            gutter,
            symbolSpacer,
        });
    }

    for (const child of tnode.children) {
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
    }

    return {
        data,
        xKey,
        yKeys,
        xAxis,
        yAxis,
        labelItems,
        legendItems,
    } as const;
}

/**
 * Parse attribute as JSON or fallback to input as is
 * Example: "20" -> 20
 *        : "[ {x: 'Jan', y: 3} ]" -> `[{"x": "Jan", "y": 3}]` (Valid RFC 8259)
 *        : "Green" -> "Green"
 */
function parseAttribute<T>(attribute: string): T | undefined {
    if (!attribute) {
        return undefined;
    }
    try {
        return JSON5.parse<T>(attribute);
    } catch {
        return attribute as T;
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
        let topLeft: number | undefined;
        let topRight: number | undefined;
        let bottomLeft: number | undefined;
        let bottomRight: number | undefined;
        if ('topLeft' in cornerRadius) {
            topLeft = Number(cornerRadius.topLeft);
        } else if ('top' in cornerRadius) {
            topLeft = Number(cornerRadius.top);
        }
        if ('topRight' in cornerRadius) {
            topLeft = Number(cornerRadius.topRight);
        } else if ('top' in cornerRadius) {
            topRight = Number(cornerRadius.top);
        }
        if ('bottomLeft' in cornerRadius) {
            bottomLeft = Number(cornerRadius.bottomLeft);
        } else if ('bottom' in cornerRadius) {
            bottomLeft = Number(cornerRadius.bottom);
        }
        if ('bottomRight' in cornerRadius) {
            bottomRight = Number(cornerRadius.bottomRight);
        } else if ('bottom' in cornerRadius) {
            bottomRight = Number(cornerRadius.bottom);
        }
        return {
            topLeft,
            topRight,
            bottomLeft,
            bottomRight,
        };
    }
    return undefined;
}

/**
 * Helper to parse VC's `domainPadding` into VN's `domainPadding`
 */
function parseDomainPadding(attribute: string): ComponentProps<typeof CartesianChart<CartesianChartData, keyof CartesianChartData, YKey>>['domainPadding'] | undefined {
    const domainPadding = parseAttribute(attribute);
    if (typeof domainPadding === 'number') {
        return domainPadding;
    }
    if (Array.isArray(domainPadding)) {
        return {
            left: Number(domainPadding.at(0)),
            right: Number(domainPadding.at(1)),
        };
    }
    if (lodashIsObject(domainPadding)) {
        let left: number | undefined;
        let right: number | undefined;
        let top: number | undefined;
        let bottom: number | undefined;
        if ('x' in domainPadding && typeof domainPadding.x === 'number') {
            left = domainPadding.x;
            right = domainPadding.x;
        } else if ('x' in domainPadding && Array.isArray(domainPadding.x)) {
            left = Number(domainPadding.x.at(0));
            right = Number(domainPadding.x.at(1));
        }
        if ('y' in domainPadding && typeof domainPadding.y === 'number') {
            top = domainPadding.y;
            bottom = domainPadding.y;
        } else if ('y' in domainPadding && Array.isArray(domainPadding.y)) {
            top = Number(domainPadding.y.at(1));
            bottom = Number(domainPadding.y.at(0));
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

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    const styles = useThemeStyles();
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();
    const {data, xKey, yKeys, xAxis, yAxis, labelItems, legendItems} = useMemo(() => processNode(tnode, regularTypeface), [tnode, regularTypeface]);
    const {nodeStyles: chartContentStyles, parentNodeStyles: chartContainerStyles} = useMemo(() => parseStyles(tnode), [tnode]);
    const [isCartesianChart, isPolarChart] = useMemo(() => [Object.keys(data).length > 0, false], [data]);

    const renderCartesianChartChild = useCallback((tnodeChild: TNode, index: number, renderArgs: CartesianChartRenderArg<CartesianChartData, YKey>) => {
        const key = `${tnodeChild.tagName ?? 'node'}-${index}`;
        const yKey = getYKey(tnodeChild);
        const {points, chartBounds} = renderArgs;
        const {nodeStyles} = parseStyles(tnodeChild);
        switch (tnodeChild.tagName) {
            case 'victorybar':
                return (
                    <Bar
                        key={key}
                        points={points[yKey]}
                        chartBounds={chartBounds}
                        color={nodeStyles.fill ?? DEFAULT_CHART_COLOR}
                        innerPadding={BAR_INNER_PADDING}
                        roundedCorners={parseCornerRadius(tnodeChild.attributes.cornerradius)}
                        barWidth={parseAttribute(tnodeChild.attributes.barwidth)}
                    />
                );
            case 'victoryline':
                return (
                    <Line
                        key={key}
                        points={points[yKey]}
                        color={nodeStyles.stroke ?? DEFAULT_CHART_COLOR}
                        strokeWidth={nodeStyles.strokeWidth !== undefined ? Number(nodeStyles.strokeWidth) : undefined}
                        curveType={parseAttribute(tnodeChild.attributes.interpolation)}
                    />
                );
            default:
                return null;
        }
    }, []);

    const renderCartesianChartOutside = useCallback(() => {
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
                {legendItems.map(({x: startX, y, entries, gutter, symbolSpacer}) => {
                    let x = startX;
                    return entries.map(({text, color, fontSize, fontWeight, symbolColor, symbolSize}) => {
                        const typeface = fontWeight === 'bold' ? boldTypeface : regularTypeface;
                        const font = typeface ? Skia.Font(typeface, fontSize) : null;
                        const fontMetrics = font?.getMetrics();
                        const lineHeight = fontMetrics ? fontMetrics.ascent + fontMetrics.descent + fontMetrics.leading : 0;
                        const symbolX = x;
                        x += (symbolSize ?? 0) + (symbolSpacer ?? 0);
                        const textX = x;
                        x += (font?.getGlyphWidths(font.getGlyphIDs(text)).reduce((acc, width) => acc + width, 0) ?? 0) + (gutter ?? 0);
                        return (
                            <Fragment key={`legend-${x}-${y}`}>
                                {!!symbolSize && (
                                    <Circle
                                        cx={symbolX}
                                        cy={y}
                                        r={symbolSize}
                                        color={symbolColor}
                                    />
                                )}
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
    }, [labelItems, legendItems, regularTypeface, boldTypeface]);

    // Invalid chart (no charts or mixed charts)
    if (isCartesianChart === isPolarChart) {
        return null;
    }

    return (
        <View style={[styles.chartContainer, styles.mw100, chartContainerStyles]}>
            <View style={[styles.chartContent, styles.mw100, chartContentStyles]}>
                <CartesianChart
                    data={Object.values(data)}
                    xKey={xKey}
                    yKeys={yKeys}
                    xAxis={xAxis}
                    yAxis={yAxis}
                    domain={parseAttribute(tnode.attributes.domain)}
                    domainPadding={parseDomainPadding(tnode.attributes.domainpadding)}
                    padding={parseAttribute(tnode.attributes.padding)}
                    renderOutside={renderCartesianChartOutside}
                >
                    {(renderArgs) => tnode.children.map((child, childIndex) => renderCartesianChartChild(child, childIndex, renderArgs))}
                </CartesianChart>
            </View>
        </View>
    );
}

BaseVictoryChartRenderer.displayName = 'BaseVictoryChartRenderer';

export default BaseVictoryChartRenderer;
