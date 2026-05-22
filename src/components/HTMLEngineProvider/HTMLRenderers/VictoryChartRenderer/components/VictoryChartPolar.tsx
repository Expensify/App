import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import Log from '@libs/Log';

/**
 * Renders the PolarChart with data drawn from context.
 */
function VictoryChartPolar() {
    const {type} = useVictoryChartContext();

    if (type !== CHART_TYPE.POLAR) {
        return null;
    }

    // Support for polar chars will be added in a follow up https://github.com/Expensify/App/issues/90546
    Log.warn('Trying to render unsupported polar charts');
    return null;
}

VictoryChartPolar.displayName = 'VictoryChartPolar';

export default VictoryChartPolar;
