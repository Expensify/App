import {Skia, Text as SkText} from '@shopify/react-native-skia';
import React from 'react';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

/**
 * Renders floating Skia text labels (from `<victorylabel>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 */
function VictoryChartLabels() {
    const {labelItems, regularTypeface, boldTypeface} = useVictoryChartContext();
    return (
        <>
            {labelItems.map(({x, y, text, color, fontSize, fontWeight}) => {
                const typeface = fontWeight === 'bold' ? boldTypeface : regularTypeface;
                const font = typeface ? Skia.Font(typeface, fontSize) : null;
                return (
                    <SkText
                        key={`text-${x}-${y}`}
                        x={x}
                        y={y}
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
