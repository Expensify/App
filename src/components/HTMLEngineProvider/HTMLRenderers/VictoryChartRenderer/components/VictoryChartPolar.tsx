import React from 'react';
import {PolarChart} from 'victory-native';
import ChartFontsLoaderProvider from '@components/Charts/context/ChartFontsLoaderProvider';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import VictoryChartCategories from './VictoryChartCategories';
import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartLegend from './VictoryChartLegend';

/**
 * Renders the PolarChart with data drawn from context.
 */
function VictoryChartPolar() {
    const {tnode, data, labelItems, legendItems} = useVictoryChartContext();

    return (
        <PolarChart
            data={Object.values(data)}
            labelKey={LABEL_KEY}
            valueKey={VALUE_KEY}
            colorKey={COLOR_KEY}
        >
            {/* Chart font context does not propagate into polar Skia children. */}
            <ChartFontsLoaderProvider>
                {tnode.children.map((child) => (
                    <VictoryChartCategories
                        key={`${child.tagName ?? 'node'}-${getHierarchyID(child)}`}
                        tnode={child}
                    />
                ))}
                {labelItems.map((labelItem) => (
                    <VictoryChartLabel
                        key={`label-${labelItem.x}-${labelItem.y}`}
                        {...labelItem}
                    />
                ))}
                {legendItems.map((legendItem) => (
                    <VictoryChartLegend
                        key={`legend-${legendItem.x}-${legendItem.y}`}
                        {...legendItem}
                    />
                ))}
            </ChartFontsLoaderProvider>
        </PolarChart>
    );
}

export default VictoryChartPolar;
