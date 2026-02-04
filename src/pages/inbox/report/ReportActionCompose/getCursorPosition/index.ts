import type {CursorPositionParamsType, PositionType} from './types';

function getCursorPosition({positionOnWeb}: CursorPositionParamsType): PositionType {
    const x = positionOnWeb?.positionX ?? 0;
    const y = positionOnWeb?.positionY ?? 0;
    return {x, y};
}

export default getCursorPosition;
