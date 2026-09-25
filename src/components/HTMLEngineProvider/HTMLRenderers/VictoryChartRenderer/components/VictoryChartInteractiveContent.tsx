import useSkiaCanvasRemountKey from '@components/Charts/hooks/useSkiaCanvasRemountKey';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

import React from 'react';

import VictoryChartCartesianInteractive from './VictoryChartCartesianInteractive';
import VictoryChartPolar from './VictoryChartPolar';

function VictoryChartInteractiveContent() {
    const {type} = useVictoryChartContext();
    // Android drops the Skia canvas surface while the app is backgrounded; remounting on resume repaints it
    const remountKey = useSkiaCanvasRemountKey();
    switch (type) {
        case CHART_TYPE.CARTESIAN:
            return <VictoryChartCartesianInteractive key={remountKey} />;
        case CHART_TYPE.POLAR:
            return <VictoryChartPolar key={remountKey} />;
        default:
            return null;
    }
}

VictoryChartInteractiveContent.displayName = 'VictoryChartInteractiveContent';

export default VictoryChartInteractiveContent;
