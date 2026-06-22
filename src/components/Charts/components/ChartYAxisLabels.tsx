import {Paragraph} from '@shopify/react-native-skia';
import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartBounds, Scale} from 'victory-native';
import {useChartParagraphs} from '@components/Charts/hooks';
import {getFontLineMetrics} from '@components/Charts/utils';
import VictoryTheme, {GLYPH_PADDING, MAX_Y_AXIS_LABEL_WIDTH} from '@components/Charts/VictoryTheme';

type ChartYAxisLabelsBaseProps = {
    /** Tick values on the axis. */
    ticks: number[];

    /** Maps a tick value to its pixel position on the chart. */
    tickScale: Scale;

    /** Font size used for rendering labels. */
    fontSize: number;

    /** Font manager for Paragraph API rendering with multi-font fallback. */
    fontMgr: SkTypefaceFontProvider;

    /** Fill color for the label text. */
    labelColor: string;

    /** Formats a tick value to its display string. */
    formatValue: (value: number) => string;
};

type ChartYAxisLabelsVerticalProps = ChartYAxisLabelsBaseProps & {
    placement?: 'left';

    /** Chart plot area bounds. */
    chartBounds: ChartBounds;

    /** When true, labels are left-aligned starting at the left edge of the chart instead of right-aligned. */
    leftAlign?: boolean;
};

type ChartYAxisLabelsBottomProps = ChartYAxisLabelsBaseProps & {
    placement: 'bottom';

    /** Y-pixel coordinate of the bottom edge of the chart plot area. */
    chartBoundsBottom: number;
};

type ChartYAxisLabelsProps = ChartYAxisLabelsVerticalProps | ChartYAxisLabelsBottomProps;

function ChartYAxisLabels(props: ChartYAxisLabelsProps) {
    const {ticks, tickScale, fontSize, fontMgr, labelColor, formatValue} = props;
    const formattedLabels = ticks.map((tick) => formatValue(tick));
    const paragraphs = useChartParagraphs(formattedLabels, fontMgr, fontSize, labelColor, MAX_Y_AXIS_LABEL_WIDTH);
    const {ascent, descent} = getFontLineMetrics(fontMgr, fontSize);
    const lineHeight = ascent + descent;

    if (props.placement === 'bottom') {
        const labelY = props.chartBoundsBottom + VictoryTheme.axis.labelGap;

        return ticks.map((tick, index) => {
            const paraData = paragraphs?.at(index);
            if (!paraData) {
                return null;
            }

            const tickX = tickScale(tick);

            return (
                <Paragraph
                    key={`value-label-bottom-${tick}`}
                    paragraph={paraData.para}
                    x={tickX - paraData.width / 2}
                    y={labelY}
                    width={paraData.width + GLYPH_PADDING}
                />
            );
        });
    }

    const maxWidth = Math.max(0, ...paragraphs.map((item) => item.width));
    const leftAlign = props.leftAlign ?? false;

    return ticks.map((tick, index) => {
        const paraData = paragraphs?.at(index);
        if (!paraData) {
            return null;
        }

        const x = props.chartBounds.left - VictoryTheme.axis.labelGap + GLYPH_PADDING - (leftAlign ? maxWidth : paraData.width);
        const tickY = tickScale(tick);

        return (
            <Paragraph
                key={`value-label-left-${tick}`}
                paragraph={paraData.para}
                x={x}
                y={tickY - lineHeight / 2}
                width={paraData.width + GLYPH_PADDING}
            />
        );
    });
}

export default ChartYAxisLabels;
