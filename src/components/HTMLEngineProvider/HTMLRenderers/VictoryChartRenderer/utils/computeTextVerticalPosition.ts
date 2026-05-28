import {TextAnchor} from '../types';

function computeTextHorizontalPosition(y: number, textHeight: number, textAnchor: TextAnchor): number {
    switch (textAnchor) {
        case 'end':
            return y + textHeight;
        case 'middle':
            return y + textHeight / 2;
        default:
            return y;
    }
}

export default computeTextHorizontalPosition;
