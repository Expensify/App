import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

/**
 * Renders the PolarChart with data drawn from context.
 */
function VictoryChartPolar() {
    const {isValidPolar} = useVictoryChartContext();

    if (!isValidPolar) {
        return;
    }

    // Support for polar chars will be added in a follow up https://github.com/Expensify/App/issues/90546
    return null;
}

VictoryChartPolar.displayName = 'VictoryChartPolar';

export default VictoryChartPolar;
