import React from 'react';
import {PolarChart} from 'victory-native';
import ChartFontsLoaderProvider from '@components/Charts/context/ChartFontsLoaderProvider';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import getChartDesignWidth from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartDesignWidth';
import getChartLayoutModeProps from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartLayoutModeProps';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import VictoryChartCategories from './VictoryChartCategories';
import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartLegend from './VictoryChartLegend';

type VictoryChartPolarProps = {
    explicitSize?: {width: number; height: number};
    headless?: boolean;
};

/**
 * Renders the PolarChart with data drawn from context.
 */
function VictoryChartPolar({explicitSize, headless}: VictoryChartPolarProps) {
    const {tnode, data, labelItems, legendItems, chartContentStyles} = useVictoryChartContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone = DateUtils.getCurrentTimezone(currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE).selected;
    const designWidth = getChartDesignWidth(explicitSize, chartContentStyles.width);

    const chartContent = (
        <>
            {tnode.children.map((child) => (
                <VictoryChartCategories
                    key={`${child.tagName ?? 'node'}-${getHierarchyID(child)}`}
                    tnode={child}
                />
            ))}
            {labelItems.map((labelItem) => (
                <VictoryChartLabel
                    key={`label-${labelItem.x}-${labelItem.y}-${timezone}`}
                    {...labelItem}
                    timezone={timezone}
                />
            ))}
            {legendItems.map((legendItem) => (
                <VictoryChartLegend
                    key={`legend-${legendItem.x}-${legendItem.y}`}
                    {...legendItem}
                    chartWidth={designWidth}
                />
            ))}
        </>
    );

    return (
        <PolarChart
            data={Object.values(data)}
            labelKey={LABEL_KEY}
            valueKey={VALUE_KEY}
            colorKey={COLOR_KEY}
            {...getChartLayoutModeProps(explicitSize, headless)}
        >
            {headless ? chartContent : <ChartFontsLoaderProvider>{chartContent}</ChartFontsLoaderProvider>}
        </PolarChart>
    );
}

export default VictoryChartPolar;
