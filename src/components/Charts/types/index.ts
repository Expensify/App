import type {LABEL_ROTATIONS} from '@components/Charts/VictoryTheme';

import type {SkParagraph} from '@shopify/react-native-skia';
import type {ValueOf} from 'type-fest';

/** One plotted dataset: a line, or one bar of every group. */
type ChartSeries = {
    /** Identifies this series' amount in every point's `values` */
    key: string;

    /** Name shown in the legend and the tooltip, left out by a chart plotting a single unnamed dataset */
    label?: string;

    /** Left out by a bar chart that colors each bar by its rank instead */
    color?: string;
};

type ChartDataPoint = {
    /** Full label for the data point (e.g., "Amazon", "November 2025") */
    label: string;

    /** Compact label for the x-axis (e.g., "Nov ’25"). Defaults to `label`. */
    shortLabel?: string;

    /** One amount per series (pre-formatted, e.g., dollars not cents), keyed by that series' key */
    values: Record<string, number>;

    /** The point's signed share of total spend, in percentage points */
    percentOfTotal?: number;
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
    series: ChartSeries[];

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

export type {CartesianChartProps, ChartDataPoint, ChartProps, ChartSeries, LabelRotation, ParagraphWithWidth, PieSlice, UnitPosition, UnitWithFallback};
