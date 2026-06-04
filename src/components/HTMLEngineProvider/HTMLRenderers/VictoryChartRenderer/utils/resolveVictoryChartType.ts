import type {SkTypeface} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';
import {CHART_TYPE, LABEL_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import type {ChartType} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

function resolveVictoryChartType(tnode: TNode, typeface: SkTypeface | null): ChartType | null {
    const {data} = processVictoryChartTree(tnode, typeface, null);
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
