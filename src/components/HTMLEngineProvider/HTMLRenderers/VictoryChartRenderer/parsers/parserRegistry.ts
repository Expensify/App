import type {NodeParser} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseVictoryAxisNode from './victoryAxisParser';
import parseVictoryBarGroupNode from './victoryBarGroupParser';
import parseVictoryChartNode from './victoryChartParser';
import parseVictoryLabelNode from './victoryLabelParser';
import parseVictoryLegendNode from './victoryLegendParser';
import parseVictoryPieNode from './victoryPieParser';
import parseVictorySeriesNode from './victorySeriesParser';

/**
 * Maps HTML tag names to their corresponding parser functions.
 * To support a new VictoryChart tag, add a new entry here and create the parser file.
 */
const PARSER_REGISTRY: Partial<Record<string, NodeParser>> = {
    victorychart: parseVictoryChartNode,
    victorybar: parseVictorySeriesNode,
    victoryline: parseVictorySeriesNode,
    victorygroup: parseVictoryBarGroupNode,
    victoryaxis: parseVictoryAxisNode,
    victorylabel: parseVictoryLabelNode,
    victorylegend: parseVictoryLegendNode,
    victorypie: parseVictoryPieNode,
};

export default PARSER_REGISTRY;
