import type {Color, SkTypeface} from '@shopify/react-native-skia';
import type {ComponentProps} from 'react';
import type {CustomRendererProps, TBlock, TNode} from 'react-native-render-html';
import type {ValueOf} from 'type-fest';
import type {CartesianChart} from 'victory-native';
import type {CHART_TYPE, X_KEY, Y_KEY_PREFIX} from './constants';

type VictoryChartRendererProps = CustomRendererProps<TBlock>;

type RawChartData = {
    x: string | number;
    y: number;
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
};

type RawLegendStyle = {
    labels?: {
        fill?: Color;
        fontSize?: string | number;
        fontWeight?: string | number;
    };
};

type XKey = typeof X_KEY;
type YKey = `${typeof Y_KEY_PREFIX}${string}`;

type CartesianChartData = {
    [X_KEY]: string | number;
    [key: `${YKey}`]: number;
};

type LabelItem = {
    /** Position on the X-axis */
    x: number;

    /** Position on the Y-axis */
    y: number;

    /** Text to draw */
    text: string;

    /** The color of the text */
    color?: Color;

    /** Font size */
    fontSize?: number;

    /** Font weight */
    fontWeight?: 'normal' | 'bold';
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
    data: Record<string, CartesianChartData>;
    xKey: XKey;
    yKeys: YKey[];
    xAxis: CartesianChartProps['xAxis'];
    yAxis: CartesianChartProps['yAxis'];
    labelItems: LabelItem[];
    legendItems: LegendItem[];
};

/** Partial slice produced by a single per-tag parser before merging. */
type PartialProcessNodeResult = Partial<ProcessNodeResult>;

type NodeParser = (tnode: TNode, typeface: SkTypeface | null) => PartialProcessNodeResult;

type ChartType = ValueOf<typeof CHART_TYPE>;

export type {
    VictoryChartRendererProps,
    RawChartData,
    RawLegendData,
    RawAxisStyle,
    RawLabelStyle,
    RawLegendStyle,
    XKey,
    YKey,
    CartesianChartData,
    CartesianChartProps,
    LabelItem,
    LegendItemEntry,
    LegendItem,
    ProcessNodeResult,
    PartialProcessNodeResult,
    NodeParser,
    ChartType,
};
