import type {TNode} from 'react-native-render-html';
import type {PartialProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import type {CartesianChartProps} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseDomainPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomainPadding';

/**
 * Parse chart config from a `<victorychart>` node.
 */
function parseVictoryChartNode(tnode: TNode): PartialProcessNodeResult {
    const domain = parseAttribute<CartesianChartProps['domain']>(tnode.attributes.domain);
    const domainPadding = parseDomainPadding(tnode.attributes.domainpadding);
    const padding = parseAttribute<CartesianChartProps['padding']>(tnode.attributes.padding);
    return {domain, domainPadding, padding};
}

export default parseVictoryChartNode;
