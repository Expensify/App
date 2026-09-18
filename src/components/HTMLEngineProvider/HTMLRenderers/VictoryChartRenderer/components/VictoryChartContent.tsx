import useSkiaCanvasRemountKey from '@components/Charts/hooks/useSkiaCanvasRemountKey';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

import React from 'react';

import VictoryChartCartesian from './VictoryChartCartesian';
import VictoryChartPolar from './VictoryChartPolar';

type VictoryChartContentProps = {
    explicitSize?: {width: number; height: number};
    headless?: boolean;

    /** Render into a static bitmap canvas instead of a live WebGL canvas (web) */
    shouldUseStaticCanvas?: boolean;
};

function VictoryChartContent({explicitSize, headless, shouldUseStaticCanvas}: VictoryChartContentProps) {
    const {type} = useVictoryChartContext();
    // Android drops the Skia canvas surface while the app is backgrounded; remounting on resume repaints it
    const remountKey = useSkiaCanvasRemountKey();
    switch (type) {
        case CHART_TYPE.CARTESIAN:
            return (
                <VictoryChartCartesian
                    key={remountKey}
                    explicitSize={explicitSize}
                    headless={headless}
                    shouldUseStaticCanvas={shouldUseStaticCanvas}
                />
            );
        case CHART_TYPE.POLAR:
            return (
                <VictoryChartPolar
                    key={remountKey}
                    explicitSize={explicitSize}
                    headless={headless}
                    shouldUseStaticCanvas={shouldUseStaticCanvas}
                />
            );
        default:
            return null;
    }
}

VictoryChartContent.displayName = 'VictoryChartContent';

export default VictoryChartContent;
