import React, {useEffect} from 'react';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import Log from '@libs/Log';
import VictoryChartCartesian from './VictoryChartCartesian';
import VictoryChartPolar from './VictoryChartPolar';

function VictoryChartContent() {
    const {type} = useVictoryChartContext();

    useEffect(() => {
        if (type) {
            return;
        }
        Log.warn('Trying to render an invalid chart (empty or mixed chart types).');
    }, [type]);

    switch (type) {
        case CHART_TYPE.CARTESIAN:
            return <VictoryChartCartesian />;
        case CHART_TYPE.POLAR:
            return <VictoryChartPolar />;
        default:
            return null;
    }
}

VictoryChartContent.displayName = 'VictoryChartContent';

export default VictoryChartContent;
