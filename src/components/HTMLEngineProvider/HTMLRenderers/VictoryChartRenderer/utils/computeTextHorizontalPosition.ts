import {TextAnchor} from '../types';

function computeTextHorizontalPosition(x: number, textWidth: number, textAnchor: TextAnchor): number {
    switch (textAnchor) {
        case 'end':
            return x - textWidth;
        case 'middle':
            return x - textWidth / 2;
        default:
            return x;
    }
}

export default computeTextHorizontalPosition;
