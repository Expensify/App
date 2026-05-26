import {useEffect} from 'react';
import Log from '@libs/Log';

/**
 * Renders the PolarChart with data drawn from context.
 */
function VictoryChartPolar() {
    useEffect(() => Log.warn('Trying to render unsupported polar charts'), []);

    // Support for polar chars will be added in a follow up https://github.com/Expensify/App/issues/90546
    return null;
}

VictoryChartPolar.displayName = 'VictoryChartPolar';

export default VictoryChartPolar;
