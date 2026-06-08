import type {Color, SkTypeface} from '@shopify/react-native-skia';
import type {ComponentProps} from 'react';
import type {CustomRendererProps, TBlock, TNode} from 'react-native-render-html';
import type {ValueOf} from 'type-fest';
import type {CartesianChart} from 'victory-native';
import type {CHART_TYPE, COLOR_KEY, LABEL_KEY, VALUE_KEY, X_KEY, Y_KEY_PREFIX} from './constants';

type VictoryChartRendererProps = CustomRendererProps<TBlock>;

type RawChartData = {
    x: string | number;
    y: number;
};

type BarTooltipEntry = {
    /** Primary lookup key: `${yKey}:${xValue}` */
    key: string;

    /** Alternate keys that resolve to the same tooltip (e.g. category index on horizontal charts) */
    keyAliases?: string[];

    /** Tooltip label text */
    label: string;

    /** Bar value in display units (dollars) */
    total: number;

    /** When true, the tooltip shows only the label without a separate amount */
    isLabelOnly: boolean;
};

type BarSeriesConfig = {
    /** Bar width in pixels, when specified on the `<victorybar>` node */
    barWidth?: number;
};

type BarGroupLayout = {
    /** yKeys for each `<victorybar>` child, in render order */
    yKeys: YKey[];

    /** Bar width shared by the group, when specified on the child nodes */
    barWidth?: number;

    /** Pixel spacing between bars in the group (from the `offset` attribute) */
    offset: number;
};

type PieTooltipEntry = {
    /** Tooltip label text */
    label: string;

    /** Slice value in display units (dollars) */
    total: number;

    /** When true, the tooltip shows only the label without a separate amount */
    isLabelOnly: boolean;
};

type RawLegendData = {
    name: string;
    symbol?: {
        fill?: Color;
        size?: string | number;
    };
};

type RawAxisStyle = {
    grid?: {
        stroke?: Color;
        strokeWidth?: string | number;
    };
    tickLabels?: {
        fill?: Color;
        padding?: string | number;
        fontSize?: string | number;
    };
};

type RawLabelStyle = {
    fill?: Color;
    fontSize?: string | number;
    fontWeight?: string | number;
    fontFamily?: string;
    fontStyle?: string;
};

type RawLegendStyle = {
    labels?: {
        fill?: Color;
        fontSize?: string | number;
        fontWeight?: string | number;
        fontFamily?: string;
        fontStyle?: string;
    };
};

type RawShiftedLineSegmentStyle = {
    stroke?: Color;
    strokeWidth?: number;
};

type XKey = typeof X_KEY;
type YKey = `${typeof Y_KEY_PREFIX}${string}`;

type CartesianChartData = {
    [X_KEY]: string | number;
    [key: `${YKey}`]: number;
};

type PolarChartData = {
    [LABEL_KEY]: string | number;
    [VALUE_KEY]: number;
    [COLOR_KEY]: Color;
};

type TextAnchor = 'start' | 'middle' | 'end';

type LabelItem = {
    /** Position on the X-axis */
    x: number;

    /** Position on the Y-axis */
    y: number;

    /** Text to draw */
    text: string;

    /** The color of the text (per line) */
    color?: Record<number, Color>;

    /** Font size (per line) */
    fontSize?: Record<number, number>;

    /** Font weight (per line) */
    fontWeight?: Record<number, 'normal' | 'bold'>;

    /** Font family (per line) */
    fontFamily?: Record<number, string>;

    /** Font style (per line) */
    fontStyle?: Record<number, string>;

    /** Line height (per line) */
    lineHeight?: Record<number, number>;

    /** Text horizontal anchor  */
    textAnchor?: TextAnchor;

    /** Text vertical anchor  */
    verticalAnchor?: TextAnchor;
};

type LegendItemEntry = {
    /** Text to draw */
    text: string;

    /** The color of the text */
    color?: Color;

    /** Font size */
    fontSize?: number;

    /** Font weight */
    fontWeight?: 'normal' | 'bold';

    /** Font family */
    fontFamily?: string;

    /** Font style */
    fontStyle?: string;

    /** The color of the symbol */
    symbolColor?: Color;

    /** Symbol size */
    symbolSize?: number;
};

type LegendItem = {
    /** Position on the X-axis */
    x: number;

    /** Position on the Y-axis */
    y: number;

    /** Legend entries */
    entries: LegendItemEntry[];

    /** Space between entries */
    gutter?: number;

    /** Space between entry's text and symbol */
    symbolSpacer?: number;
};

/** Shared CartesianChart prop type used by the orchestrator, parsers, and Cartesian sub-component. */
type CartesianChartProps = ComponentProps<typeof CartesianChart<CartesianChartData, keyof CartesianChartData, YKey>>;

/** Fully merged result of walking the HTML tnode tree. */
type ProcessNodeResult = {
    data: Record<string, CartesianChartData> | Record<string, PolarChartData>;
    xKey: XKey;
    yKeys: YKey[];
    xAxis: CartesianChartProps['xAxis'];
    yAxis: CartesianChartProps['yAxis'];
    domain: CartesianChartProps['domain'];
    domainPadding: CartesianChartProps['domainPadding'];
    padding: CartesianChartProps['padding'];
    isHorizontal: boolean | undefined;
    categories: string[] | undefined;
    labelItems: LabelItem[];
    legendItems: LegendItem[];
    barTooltipEntries: BarTooltipEntry[];
    barYKeys: YKey[];
    barSeriesConfig: Partial<Record<YKey, BarSeriesConfig>>;
    barGroupLayouts: BarGroupLayout[];
    pieTooltipEntries: PieTooltipEntry[];
};

/** Partial slice produced by a single per-tag parser before merging. */
type PartialProcessNodeResult = Partial<ProcessNodeResult>;

type NodeParser = (tnode: TNode, typeface: SkTypeface | null, rootProcessedResult: ProcessNodeResult | null) => PartialProcessNodeResult;

type ChartType = ValueOf<typeof CHART_TYPE>;

export type {
    VictoryChartRendererProps,
    RawChartData,
    BarTooltipEntry,
    BarSeriesConfig,
    BarGroupLayout,
    PieTooltipEntry,
    RawLegendData,
    RawAxisStyle,
    RawLabelStyle,
    RawLegendStyle,
    RawShiftedLineSegmentStyle,
    YKey,
    CartesianChartData,
    CartesianChartProps,
    TextAnchor,
    LabelItem,
    LegendItemEntry,
    LegendItem,
    ProcessNodeResult,
    PartialProcessNodeResult,
    NodeParser,
    PolarChartData,
    ChartType,
};
