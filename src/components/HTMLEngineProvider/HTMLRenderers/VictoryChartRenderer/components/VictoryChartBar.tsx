import {Path, Skia} from '@shopify/react-native-skia';
import React from 'react';
import type {TNode} from 'react-native-render-html';
import {Bar} from 'victory-native';
import {BAR_INNER_PADDING} from '@components/Charts/BarChart/BarChartContent';
import {DEFAULT_CHART_COLOR} from '@components/Charts/utils';
import {useVictoryChartRenderArgs} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseCornerRadius from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseCornerRadius';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';

type VictoryChartBarProps = {
    tnode: TNode;
    /** When true, render bars left-to-right instead of bottom-up. Passed down from VictoryChartCartesian. */
    horizontal: boolean;
    /** Pixel offset along the category axis from `<victorygroup offset="…">`. Applied in horizontal mode. */
    groupOffset: number;
};

/** Corner radius for horizontal-mode bars when the HTML does not specify cornerradius. */
const DEFAULT_HORIZONTAL_BAR_CORNER_RADIUS = 4;

function VictoryChartBar({tnode, horizontal, groupOffset}: VictoryChartBarProps) {
    const {points, chartBounds, xScale} = useVictoryChartRenderArgs();
    const yKey = getYKey(tnode);
    const {nodeStyles} = parseStyles(tnode);
    const color = nodeStyles.fill ?? DEFAULT_CHART_COLOR;
    const cornerRadius = parseCornerRadius(tnode.attributes.cornerradius);
    const barWidthAttr = parseAttribute<number>(tnode.attributes.barwidth);

    if (!horizontal) {
        return (
            <Bar
                points={points[yKey]}
                chartBounds={chartBounds}
                color={color}
                innerPadding={BAR_INNER_PADDING}
                roundedCorners={cornerRadius}
                barWidth={barWidthAttr}
            />
        );
    }

    // Victory's <Bar> is vertical-only, so for horizontal mode we build one rounded-rect Skia path
    // per bar. Bars start at xScale(0) (the value-axis baseline) and extend to point.x (canvas X of
    // the data point's numeric value). Each bar is centered vertically on point.y (canvas Y of the
    // row index) with a thickness derived from the row spacing minus inner padding.
    const seriesPoints = points[yKey] ?? [];
    const rowCount = Math.max(1, seriesPoints.length);
    const rowHeight = (chartBounds.bottom - chartBounds.top) / rowCount;
    const thickness = barWidthAttr ?? (1 - BAR_INNER_PADDING) * rowHeight;
    if (thickness <= 0) {
        return null;
    }
    const halfH = thickness / 2;
    // Honor cornerradius on the value-end corners; default to a small uniform radius if not given.
    const radius = cornerRadius?.topRight ?? cornerRadius?.bottomRight ?? cornerRadius?.topLeft ?? cornerRadius?.bottomLeft ?? DEFAULT_HORIZONTAL_BAR_CORNER_RADIUS;
    const safeRadius = Math.min(radius, halfH);
    const baseline = xScale(0);

    return (
        <>
            {seriesPoints.map((point, index) => {
                if (typeof point.y !== 'number') {
                    return null;
                }
                const valueEndX = point.x;
                const left = Math.min(baseline, valueEndX);
                const right = Math.max(baseline, valueEndX);
                const width = Math.max(0, right - left);
                if (width <= 0) {
                    return null;
                }
                // groupOffset shifts the bar along the category axis (Y in horizontal mode), so
                // sibling series within a <victorygroup> sit side-by-side instead of overlapping.
                const top = point.y + groupOffset - halfH;
                const path = Skia.Path.Make();
                const rrect = Skia.RRectXY(Skia.XYWHRect(left, top, width, thickness), safeRadius, safeRadius);
                path.addRRect(rrect);
                return (
                    <Path
                        // eslint-disable-next-line react/no-array-index-key
                        key={`horizontal-bar-${yKey}-${index}`}
                        path={path}
                        color={color}
                        // eslint-disable-next-line react/style-prop-object
                        style="fill"
                    />
                );
            })}
        </>
    );
}

VictoryChartBar.displayName = 'VictoryChartBar';

export default VictoryChartBar;
