import {CHART_TYPE, LABEL_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {ChartType, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

function resolveVictoryChartType(data: ProcessNodeResult['data']): ChartType | null {
    const hasCartesianData = Object.values(data).some((entry) => X_KEY in entry);
    const hasPolarData = Object.values(data).some((entry) => LABEL_KEY in entry);

    if (hasCartesianData === hasPolarData) {
        return null;
    }

    if (hasCartesianData) {
        return CHART_TYPE.CARTESIAN;
    }

    return CHART_TYPE.POLAR;
}

export default resolveVictoryChartType;
