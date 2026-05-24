import type {TNode} from 'react-native-render-html';
import {getChartColor} from '@components/Charts/utils';
import {POLAR_COLOR_KEY, POLAR_LABEL_KEY, POLAR_VALUE_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {PartialProcessNodeResult, PolarChartData, RawChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parse pie config from a `<victorypie>` node.
 * Data points use the same {x, y} format as cartesian series; colorscale provides per-slice colors.
 */
function parseVictoryPieNode(tnode: TNode): PartialProcessNodeResult {
    const points = parseAttribute<RawChartData[]>(tnode.attributes.data) ?? [];
    const colorScale = parseAttribute<string[]>(tnode.attributes.colorscale) ?? [];
    const innerRadius = parseAttribute<number>(tnode.attributes.innerradius);
    const startAngle = parseAttribute<number>(tnode.attributes.startangle);
    const endAngle = parseAttribute<number>(tnode.attributes.endangle);

    const circleSweepDegrees = endAngle !== undefined && startAngle !== undefined ? endAngle - startAngle : endAngle;

    const data: PolarChartData[] = points.map((point, index) => ({
        [POLAR_LABEL_KEY]: String(point.x),
        [POLAR_VALUE_KEY]: point.y,
        [POLAR_COLOR_KEY]: colorScale.at(index) ?? getChartColor(index),
    }));

    return {
        polarConfig: {
            data,
            innerRadius,
            startAngle,
            circleSweepDegrees,
        },
    };
}

export default parseVictoryPieNode;
