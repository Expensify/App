import type {TextAnchor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from './parseAttribute';

function parseTextAnchor(attribute: string): TextAnchor | undefined {
    const textAnchor = parseAttribute(attribute);
    const validTextAnchors = ['start', 'middle', 'end'] as const;
    return validTextAnchors.find((validTextAnchor) => validTextAnchor === textAnchor);
}

export default parseTextAnchor;
