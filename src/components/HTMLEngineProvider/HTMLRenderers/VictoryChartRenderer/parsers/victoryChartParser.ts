import type {TNode} from 'react-native-render-html';
import type {PartialProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseCategories from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseCategories';
import parseDomain from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomain';
import parseDomainPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomainPadding';
import parsePadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parsePadding';

/**
 * Parse chart config from a `<victorychart>` node.
 */
function parseVictoryChartNode(tnode: TNode): PartialProcessNodeResult {
    const isHorizontal = 'horizontal' in tnode.attributes && tnode.attributes.horizontal !== 'false';
    const domain = parseDomain(tnode.attributes.domain, isHorizontal);
    const domainPadding = parseDomainPadding(tnode.attributes.domainpadding, isHorizontal);
    const padding = parsePadding(tnode.attributes.padding);
    const categories = parseCategories(tnode.attributes.categories);
    return {domain, domainPadding, padding, isHorizontal, categories};
}

export default parseVictoryChartNode;
