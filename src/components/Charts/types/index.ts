import type {LABEL_ROTATIONS} from '@components/Charts/VictoryTheme';

import type {SkParagraph} from '@shopify/react-native-skia';
import type {NonEmptyTuple, ValueOf} from 'type-fest';

/** One plotted dataset: a line, or one bar of every group. */
type ChartSeries = {
    /** Identifies this series' amount in every point's `values` */
    key: string;

    /** Color of the series' line. Left out, the chart's default color. */
    color?: string;

    /** Names the series in the tooltip, like "Average" */
    label?: string;
};

type ChartDataPoint = {
    /** Full label for the data point (e.g., "Amazon", "November 2025") */
    label: string;

    /** Compact label for the x-axis (e.g., "Nov ’25"). Defaults to `label`. */
    shortLabel?: string;

    /** One amount per series (pre-formatted, e.g., dollars not cents), keyed by that series' key */
    values: Partial<Record<string, number>>;

    /** The point's signed share of total spend, in percentage points */
    percentOfTotal?: number;

    /** Each series' name for the dates this point covers in its period, which names its row in the tooltip */
    seriesLabels?: Partial<Record<string, string>>;

    /** Each series' share of its own period's total spend, in percentage points, set when several series are compared */
    seriesPercentOfTotal?: Partial<Record<string, number>>;

    /** Color of the point's bar or slice. Left out, the chart's default color. */
    color?: string;

    /** Color of each series' bar at the point, keyed by the series' key. Left out, `color` for the first series and each other series' own color. */
    seriesColors?: Partial<Record<string, string>>;

    /** Number of expenses in this point */
    count?: number;

    /** Marks a time-based point whose period hasn't ended yet, the current one or a later one, so its total is still changing. A line chart draws these points dashed. */
    isInProgress?: boolean;
};

/**
 * Unit with font fallback support.
 * The chart checks if the font can render `value` and uses `fallback` if not.
 */
type UnitWithFallback = {value: string; fallback: string};

/** Position of the unit symbol relative to the formatted value. */
type UnitPosition = 'left' | 'right';

type ChartProps = {
    data: ChartDataPoint[];

    /** The datasets plotted, in drawing order. The first one is the chart's primary series. */
    series: NonEmptyTuple<ChartSeries>;

    isLoading?: boolean;
};

type CartesianChartProps = ChartProps & {
    /** Symbol/unit for Y-axis labels with font fallback support. */
    yAxisUnit?: UnitWithFallback;

    /** Position of the unit symbol relative to the value. Defaults to 'left'. */
    yAxisUnitPosition?: UnitPosition;
};

type PieSlice = {
    /** Display label for this slice */
    label: string;

    /** Absolute value used for slice sizing */
    value: number;

    /** Hex color assigned based on sorted rank */
    color: string;

    /** Percentage of the drawn donut this slice represents */
    percentage: number;

    /** Starting angle in degrees (0 = 3 o'clock) */
    startAngle: number;

    /** Ending angle in degrees */
    endAngle: number;

    /** Index in the original unsorted data array, used to map back for tooltips */
    originalIndex: number;

    /** Ordinal position in the processed slice list (0 = largest slice). */
    ordinalIndex: number;

    /** Position of the tooltip on label hover. */
    tooltipPosition: {x: number; y: number};
};

type LabelRotation = ValueOf<typeof LABEL_ROTATIONS>;

type ParagraphWithWidth = {para: SkParagraph | null; width: number};

/** Layout for wrapped (multi-line, centered, horizontal) bar labels. Absent means single-line axis-style labels. */
type WrappedLabelConfig = {
    /** Pixel width of a bar's column; a wrapped label fills it, centered on the bar. */
    columnWidth: number;

    /** Maximum lines a wrapped label uses before it is truncated with an ellipsis. */
    maxLines: number;

    /** Pixel line height reserved per label line, shared so the hit box matches the painted lines. */
    lineHeight: number;

    /** Whether each label has text, so empty labels stay non-interactive in hit testing. */
    hasLabel: boolean[];

    /** Full canvas width (px), used to keep edge labels from clipping past the canvas. */
    canvasWidth: number;
};

export type {CartesianChartProps, ChartDataPoint, ChartProps, ChartSeries, LabelRotation, ParagraphWithWidth, PieSlice, UnitPosition, UnitWithFallback, WrappedLabelConfig};
