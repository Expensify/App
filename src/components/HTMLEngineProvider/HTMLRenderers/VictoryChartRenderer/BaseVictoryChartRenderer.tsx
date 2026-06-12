import React, {useMemo} from 'react';
import {ChartFontsProvider} from '@components/Charts/hooks';
import useChartFonts from '@components/Charts/hooks/useChartFonts';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import Log from '@libs/Log';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartContent from './components/VictoryChartContent';
import {VictoryChartProvider} from './context/VictoryChartContext';
import processVictoryChartTree from './parsers/processVictoryChartTree';
import type {VictoryChartRendererProps} from './types';
import resolveVictoryChartType from './utils/resolveVictoryChartType';

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    const fonts = useChartFonts();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const viewerTimezone = useMemo(() => {
        const timezone = currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE;
        return DateUtils.getCurrentTimezone(timezone).selected;
    }, [currentUserPersonalDetails?.timezone?.automatic, currentUserPersonalDetails?.timezone?.selected]);

    const processedResult = useMemo(() => {
        try {
            return processVictoryChartTree(tnode, fonts.typefaces.EXP_NEUE, null, viewerTimezone);
        } catch (error) {
            // Malformed chart HTML can make a parser throw. Fail closed (render nothing) instead of crashing the whole report.
            Log.warn('[VictoryChartRenderer] Failed to process chart tree from malformed HTML', {error});
            return null;
        }
    }, [tnode, fonts.typefaces.EXP_NEUE, viewerTimezone]);

    if (!processedResult) {
        return null;
    }

    const type = resolveVictoryChartType(processedResult.data);
    if (!type) {
        Log.warn('Trying to render an invalid chart (empty or mixed chart types).');
        return null;
    }

    return (
        <ChartFontsProvider value={fonts}>
            <VictoryChartProvider
                tnode={tnode}
                processedResult={processedResult}
                type={type}
            >
                <VictoryChartContainer>
                    <VictoryChartContent />
                </VictoryChartContainer>
            </VictoryChartProvider>
        </ChartFontsProvider>
    );
}

export default BaseVictoryChartRenderer;
