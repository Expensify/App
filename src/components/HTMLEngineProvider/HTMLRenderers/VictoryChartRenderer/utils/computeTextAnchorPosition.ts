import type {TextAnchor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

function computeTextAnchorPosition(base: number, total: number, textAnchor: TextAnchor): number {
    switch (textAnchor) {
        case 'end':
            return base - total;
        case 'middle':
            return base - total / 2;
        default:
            return base;
    }
}

export default computeTextAnchorPosition;
