import {Skia, Text as SkText} from '@shopify/react-native-skia';
import React from 'react';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import type {VictoryChartScaleValue} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartScaleContext';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type VictoryChartLabelsProps = {
    labelItems: LabelItem[];
    scale: VictoryChartScaleValue;
};

/**
 * Renders floating Skia text labels (from `<victorylabel>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 * Scale must be passed as a prop because Skia's Canvas uses a separate reconciler
 * that does not inherit React context from the outer tree.
 */
function VictoryChartLabels({labelItems, scale}: VictoryChartLabelsProps) {
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();
    return (
        <>
            {labelItems.map(({x, y, text, color, fontSize, fontWeight}) => {
                const scaledX = x * scale.x;
                const scaledY = y * scale.y;
                const scaledFontSize = fontSize !== undefined ? fontSize * Math.min(scale.x, scale.y) : undefined;
                const typeface = fontWeight === 'bold' ? boldTypeface : regularTypeface;
                const font = typeface ? Skia.Font(typeface, scaledFontSize) : null;
                return (
                    <SkText
                        key={`text-${x}-${y}`}
                        x={scaledX}
                        y={scaledY}
                        text={text}
                        font={font}
                        color={color}
                    />
                );
            })}
        </>
    );
}

VictoryChartLabels.displayName = 'VictoryChartLabels';

export default VictoryChartLabels;
