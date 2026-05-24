import {Skia, Text as SkText} from '@shopify/react-native-skia';
import React from 'react';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {useVictoryChartScale} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartScaleContext';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type VictoryChartLabelsProps = {
    labelItems: LabelItem[];
};

/**
 * Renders floating Skia text labels (from `<victorylabel>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 */
function VictoryChartLabels({labelItems}: VictoryChartLabelsProps) {
    const {regular: regularTypeface, bold: boldTypeface} = useChartDefaultTypeface();
    const scale = useVictoryChartScale();
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
