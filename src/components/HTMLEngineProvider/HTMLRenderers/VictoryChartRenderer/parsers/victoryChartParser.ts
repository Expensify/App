import type {TNode} from 'react-native-render-html';
import type {PartialProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseDomain from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomain';
import parseDomainPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomainPadding';
import parsePadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parsePadding';

/**
 * Parse chart config from a `<victorychart>` node.
 */
function parseVictoryChartNode(tnode: TNode): PartialProcessNodeResult {
    const isHorizontal = 'horizontal' in tnode.attributes && tnode.attributes.horizontal !== 'false';
    const domain = parseDomain(tnode.attributes.domain);
    const domainPadding = parseDomainPadding(tnode.attributes.domainpadding);
    const padding = parsePadding(tnode.attributes.padding);
    return {domain, domainPadding, padding, isHorizontal};
}

export default parseVictoryChartNode;
