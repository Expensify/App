import type {Color} from '@shopify/react-native-skia';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import type {X_KEY, Y_KEY_PREFIX} from './constants';

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

export type {VictoryChartRendererProps, RawChartData, RawLegendData, RawAxisStyle, RawLabelStyle, RawLegendStyle, XKey, YKey, CartesianChartData, LabelItem, LegendItemEntry, LegendItem};
