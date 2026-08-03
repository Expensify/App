import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

import React from 'react';

import VictoryChartCartesianInteractive from './VictoryChartCartesianInteractive';
import VictoryChartContent from './VictoryChartContent';

function VictoryChartInteractiveContent() {
    const {type} = useVictoryChartContext();
    if (type !== CHART_TYPE.CARTESIAN) {
        return <VictoryChartContent />;
    }

    return <VictoryChartCartesianInteractive />;
}

VictoryChartInteractiveContent.displayName = 'VictoryChartInteractiveContent';

export default VictoryChartInteractiveContent;
