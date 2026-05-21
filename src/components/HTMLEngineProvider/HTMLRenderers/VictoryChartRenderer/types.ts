import type {Color} from '@shopify/react-native-skia';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {X_KEY, Y_KEY_PREFIX} from './constants';

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

type xKey = typeof X_KEY;
type yKey = `${typeof Y_KEY_PREFIX}${string}`;

type CartesianChartData = {
    [X_KEY]: string | number;
    [key: `${yKey}`]: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyleObject = Record<string, any>;

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

export type {VictoryChartRendererProps, RawChartData, RawLegendData, xKey, yKey, CartesianChartData, StyleObject, LabelItem, LegendItemEntry, LegendItem};
