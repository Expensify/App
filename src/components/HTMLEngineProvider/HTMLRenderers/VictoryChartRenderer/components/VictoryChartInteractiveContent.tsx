import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

import React from 'react';

import VictoryChartCartesianInteractive from './VictoryChartCartesianInteractive';
import VictoryChartPolar from './VictoryChartPolar';

function VictoryChartInteractiveContent() {
    const {type} = useVictoryChartContext();
    switch (type) {
        case CHART_TYPE.CARTESIAN:
            return <VictoryChartCartesianInteractive />;
        case CHART_TYPE.POLAR:
            return <VictoryChartPolar />;
        default:
            return null;
    }
}

VictoryChartInteractiveContent.displayName = 'VictoryChartInteractiveContent';

export default VictoryChartInteractiveContent;
